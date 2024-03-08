import { Injectable, OnDestroy } from '@angular/core';
import { SudokuUtil } from 'src/app/shared/utils/sudoku.util';
import { Board, BoardSet } from './board.types';
import { GameLevel, GameStateService } from 'src/app/shared/services/game-state.service';
import { Address, Field } from './field/field.types';
import { BehaviorSubject, Observable, ReplaySubject, Subject, Subscription, combineLatest, map, tap, withLatestFrom } from 'rxjs';
import { BoardBuilder } from 'src/app/shared/builders/board.builder';
import { ControlsService, FeatureClickEvent, NumberClickEvent } from '../controls/controls.service';
import { InputMode } from 'src/app/shared/services/game-state.types';
import { HistoryService } from 'src/app/shared/services/history.service';
import { NotesBuilder } from 'src/app/shared/builders/notes.builder';
import { TimerService } from 'src/app/shared/services/timer.service';

@Injectable({
  providedIn: 'root',
})
export class BoardService implements OnDestroy {
  private inputMode: InputMode = 'value';
  private _selectedField!: Field;
  private _board!: Board;
  private subscriptions$: Subscription[] = [];

  private readonly selectedField$ = new ReplaySubject<Field>();
  private readonly board$ = new BehaviorSubject<Board>(
    new BoardBuilder({ level: this.gameStateServ.selectedLevel }).get()
  );

  private boardSub$: Subscription = this.getBoard$()
    .pipe(withLatestFrom(this.timerServ.getTimestring()))
    .subscribe(([board, timestring]) => {
    this._board = board;
    console.log('timestring', timestring);
    this.gameStateServ.setGameState({
      board: board,
      selectedField: this._selectedField,
      history: this.historyServ.historyBoards,
      level: this.gameStateServ.selectedLevel,
      timestring: timestring,
      mistakes: 1
    });
  });

  private selectedFieldSub$: Subscription = this.getSelectedField$().subscribe((field) => {
    this._selectedField = field;
  });

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
    private readonly historyServ: HistoryService,
    private readonly timerServ: TimerService,
  ) {
    this.registerSubscriptions();

    /*
  level: Levels;
  timestring: Timestring;
  history: HistoryBoard[];
  board: Board;
  mistakes: number;
  selectedField: Field;
}

    */
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
      this.selectedFieldSub$,
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
      const addr: Address = this._selectedField.address;
      const isUserValue = this.board[addr.row][addr.col].isInitialValue === false;
      if (isUserValue) {
        const clearedField = new BoardBuilder({ board: this.board }).unselectAllFields().eraseField(addr).get();
        this.historyServ.add(clearedField, this._selectedField);
        this.setBoard(clearedField);
        this.gameStateServ.onBoardFieldClick({ ...this._selectedField, ...{ value: 0, highlight: false } });
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
    const notInitialValue = !this._selectedField.isInitialValue;
    const notCorrectValue =
      !this.board[this._selectedField.address.row][this._selectedField.address.col].isCorrectValue;
    const notNotesMode = this.inputMode !== 'notes';
    if (notInitialValue && notCorrectValue && notNotesMode) {
      this.setBoard(
        new BoardBuilder({ board: this._board })
          .unselectAllFields()
          .updateFieldInBoard({ address: this._selectedField.address, value: numberClickEvent.number })
          .highlightFields(this._selectedField.address)
          .selectFieldsByNumber(numberClickEvent.number)
          .get()
      );
      this.historyServ.add(new BoardBuilder({ board: this._board }).unselectAllFields().get(), this._selectedField);
      this.setSelectedField({ ...this._selectedField, value: numberClickEvent.number });
    } else if (!notNotesMode) {
      this.setBoard(
        new BoardBuilder({ board: this._board })
          .unselectAllFields(this._selectedField.address)
          .updateFieldInBoard({
            address: this._selectedField.address,
            notes: new NotesBuilder(this._selectedField.notes.filter((x) => x.active === true).map((x) => x.value))
              .update([numberClickEvent.number])
              .get(),
          })
          .highlightFields(this._selectedField.address)
          .get()
      );
      this.historyServ.add(new BoardBuilder({ board: this._board }).unselectAllFields().get(), this._selectedField);
      this.setSelectedField({
        ...this._selectedField,
        notes: new NotesBuilder(this._selectedField.notes.filter((x) => x.active === true).map((x) => x.value))
          .update([numberClickEvent.number])
          .get(),
      });
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
      this.setSelectedField(field);
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
      this.setSelectedField(field);
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

  getSelectedField$(): Observable<Field> {
    return this.selectedField$.asObservable();
  }

  setSelectedField(value: Field): void {
    this.selectedField$.next(value);
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
    this.setSelectedField(board.flat().filter((f) => f.selected === true)[0]);
  }
}
