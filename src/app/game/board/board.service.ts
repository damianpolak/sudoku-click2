import { Injectable, OnDestroy } from '@angular/core';
import { SudokuUtil } from 'src/app/shared/utils/sudoku.util';
import { Board, BoardSet } from './board.types';
import { GameLevel, GameStateService } from 'src/app/shared/services/game-state.service';
import { Address, Field } from './field/field.types';
import { BehaviorSubject, Observable, Subject, Subscription, map, tap } from 'rxjs';
import { BoardBuilder } from 'src/app/shared/builders/board.builder';
import { ControlsService, FeatureClickEvent, NumberClickEvent } from '../controls/controls.service';
import { InputMode } from 'src/app/shared/services/game-state.types';
import { HistoryService } from 'src/app/shared/services/history.service';
import { NotesBuilder } from 'src/app/shared/builders/notes.builder';

@Injectable({
  providedIn: 'root',
})
export class BoardService implements OnDestroy {
  private inputMode: InputMode = 'value';
  private selectedField!: Field;
  private _board!: Board;
  private subscriptions$: Subscription[] = [];

  private readonly board$ = new BehaviorSubject<Board>(
    new BoardBuilder({ level: this.gameStateServ.selectedLevel }).get()
  );

  private boardSub$: Subscription = this.getBoard$().subscribe((board) => (this._board = board));
  private inputModeSub$: Subscription = this.gameStateServ.getInputMode$().subscribe((x) => (this.inputMode = x));
  private fieldClickSub$: Subscription = this.gameStateServ
    .getBoardFieldClick$()
    .subscribe((v) => this.onFieldClick(v));

  private numberClickSub$: Subscription = this.controlsServ.getNumberClick$().subscribe((v) => {
    this.onNumberClick(v);
  });

  private featureClickSub$: Subscription = this.controlsServ
    .getFeatureClick$()
    .subscribe((v) => this.onFeatureClick(v));

  get board() {
    return this._board;
  }

  constructor(
    private readonly gameStateServ: GameStateService,
    private readonly controlsServ: ControlsService,
    private readonly historyServ: HistoryService
  ) {
    this.registerSubscriptions();
  }

  ngOnDestroy(): void {
    this.unsubscribeSubscriptions();
  }

  private registerSubscriptions(): void {
    this.subscriptions$ = [
      ...this.subscriptions$,
      this.boardSub$,
      this.inputModeSub$,
      this.fieldClickSub$,
      this.numberClickSub$,
      this.featureClickSub$,
    ];
  }

  private unsubscribeSubscriptions(): void {
    this.subscriptions$.forEach((sub) => sub.unsubscribe());
    this.subscriptions$ = [];
  }

  private onFeatureClick(featureClickEvent: FeatureClickEvent): void {
    if (featureClickEvent.feature === 'notes') {
      this.gameStateServ.setInputMode(this.inputMode === 'value' ? 'notes' : 'value');
    }

    if (featureClickEvent.feature === 'erase') {
      const addr: Address = this.selectedField.address;
      const isUserValue = this.board[addr.row][addr.col].isInitialValue === false;
      if (isUserValue) {
        const clearedField = new BoardBuilder({ board: this.board }).unselectAllFields().eraseField(addr).get();
        this.historyServ.add(clearedField, this.selectedField);
        this.setBoard(clearedField);
        this.gameStateServ.onBoardFieldClick({ ...this.selectedField, ...{ value: 0, highlight: false } });
      }
    }

    if (featureClickEvent.feature === 'back') {
      const lastHistory = this.historyServ.back();
      if (typeof lastHistory !== 'undefined') {
        this.setBoard(lastHistory.board);
        this.gameStateServ.onBoardFieldClick(lastHistory.selectedField);
      }
    }
  }

  private onNumberClick(numberClickEvent: NumberClickEvent): void {
    const notInitialValue = !this.selectedField.isInitialValue;
    const notCorrectValue = !this.board[this.selectedField.address.row][this.selectedField.address.col].isCorrectValue;
    const notNotesMode = this.inputMode !== 'notes';
    if (notInitialValue && notCorrectValue && notNotesMode) {
      this.setBoard(
        new BoardBuilder({ board: this._board })
          .unselectAllFields()
          .updateFieldInBoard({ address: this.selectedField.address, value: numberClickEvent.number })
          .highlightFields(this.selectedField.address)
          .selectFieldsByNumber(numberClickEvent.number)
          .get()
      );
      this.historyServ.add(new BoardBuilder({ board: this._board }).unselectAllFields().get(), this.selectedField);
      this.selectedField = { ...this.selectedField, value: numberClickEvent.number };
    } else if (!notNotesMode) {
      this.setBoard(
        new BoardBuilder({ board: this._board })
          .unselectAllFields(this.selectedField.address)
          .updateFieldInBoard({
            address: this.selectedField.address,
            notes: new NotesBuilder(this.selectedField.notes.filter((x) => x.active === true).map((x) => x.value))
              .update([numberClickEvent.number])
              .get(),
          })
          .highlightFields(this.selectedField.address)
          .get()
      );
      this.historyServ.add(new BoardBuilder({ board: this._board }).unselectAllFields().get(), this.selectedField);
      this.selectedField = {
        ...this.selectedField,
        notes: new NotesBuilder(this.selectedField.notes.filter((x) => x.active === true).map((x) => x.value))
          .update([numberClickEvent.number])
          .get(),
      };
    }
  }

  private onFieldClick(field: Field): void {
    if (this.isFieldNotEmpty(field.value)) {
      this.setBoard(
        new BoardBuilder({ board: this.board })
          .unselectAllFields()
          .highlightFields(field.address)
          .selectFieldsByNumber(field.value)
          .get()
      );
      this.selectedField = field;
    } else {
      this.setBoard(
        new BoardBuilder({ board: this.board })
          .unselectAllFields()
          .highlightFields(field.address)
          .updateFieldInBoard({
            ...{ address: field.address },
            ...{ selected: field.selected },
          })
          .get()
      );
      this.selectedField = field;
    }
  }

  getBoard$(): Observable<Board> {
    return this.board$
      .asObservable()
      .pipe(
        tap((_) => {
          this.updateMissingNumbers(_);
        })
      )
      .pipe(map((x) => x));
  }

  setBoard(board: Board): void {
    this.board$.next(board);
  }

  private updateMissingNumbers(board: Board): void {
    this.gameStateServ.setMissingNumbers(
      this.getMissingNumbers(SudokuUtil.toNumericBoard(board, 'value')).map((i, index) => {
        return {
          id: index + 1,
          value: i,
        };
      })
    );
  }

  private getMissingNumbers(board: number[][], max: number = 9): number[] {
    const b = structuredClone(board).flat();
    const missingArr: number[] = [];
    for (let i = 1; i <= max; i++) {
      missingArr.push(max - b.filter((f) => f === i).length);
    }
    return missingArr;
  }

  private isFieldNotEmpty(value: number): boolean {
    return value !== 0;
  }

  setDefaultSelectedField(): void {
    const board = new BoardBuilder({ board: this.board }).setDefaultSelectedField().get();
    this.setBoard(board);
    this.selectedField = board.flat().filter((f) => f.selected === true)[0];
  }
}
