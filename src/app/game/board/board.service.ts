import { Inject, Injectable, OnDestroy } from '@angular/core';
import { SudokuUtil } from 'src/app/shared/utils/sudoku.util';
import { Board, BoardSet } from './board.types';
import { GameLevel, GameStateService } from 'src/app/shared/services/game-state.service';
import { Address, Field } from './field/field.types';
import { BehaviorSubject, Observable, Subscription, combineLatest, every, from, map, tap, withLatestFrom } from 'rxjs';
import { BoardBuilder } from 'src/app/shared/builders/board.builder';
import { ControlsService, FeatureClickEvent, NumberClickEvent } from '../controls/controls.service';
import { GameStartMode, GameStartType, InputMode } from 'src/app/shared/services/game-state.types';
import { HistoryService } from 'src/app/shared/services/history.service';
import { NotesBuilder } from 'src/app/shared/builders/notes.builder';
import { TimerService } from 'src/app/shared/services/timer.service';
import { MistakeService } from 'src/app/shared/services/mistake.service';

@Injectable()
export class BoardService implements OnDestroy {
  private readonly gameStartModeSub$: Subscription = this.gameStateServ
    .getGameStartMode$()
    .pipe(
      tap((_) => {
        this.gameStartModeHandler(_);
      })
    )
    .subscribe();

  private defaultBaseBoard!: BoardBuilder;

  private inputMode: InputMode = 'value';
  private _selectedField!: Field;
  private _board!: Board;
  private subscriptions$: Subscription[] = [];

  private readonly selectedField$ = new BehaviorSubject<Field>(this.defaultBaseBoard.getSelectedFields()[0]);
  private readonly board$ = new BehaviorSubject<Board>(this.defaultBaseBoard.get());

  private boardSub$: Subscription = this.getBoard$()
    .pipe(
      tap((_) => {
        if (_.flat().every((x) => x.isCorrectValue)) {
          this.gameStateServ.setWin(true);
        }
      })
    )
    .subscribe((v) => {
      this._board = v;
    });

  private progressSub$: Subscription = combineLatest([
    this.getBoard$(),
    this.getSelectedField$(),
    this.historyServ.get$(),
    this.timerServ.getTimestring(),
    this.mistakeServ.get$(),
  ]).subscribe(([board, field, history, timestring, mistake]) => {
    this.gameStateServ.setGameState({
      board: board,
      selectedField: field,
      history: history,
      level: this.gameStateServ.selectedLevel,
      timestring: timestring,
      mistakes: mistake,
    });
  });

  private selectedFieldSub$: Subscription = this.getSelectedField$().subscribe((field) => {
    this._selectedField = field;
  });

  private inputModeSub$: Subscription = this.gameStateServ.getInputMode$().subscribe((x) => (this.inputMode = x));
  private fieldClickSub$: Subscription = this.gameStateServ
    .getBoardFieldClick$()
    .subscribe((v) => this.onFieldClick(v));

  private numberClickSub$: Subscription = this.controlsServ
    .getNumberClick$()
    .pipe(
      tap((_) => {
        this.mistakeUpdateHandler(_);
      })
    )
    .subscribe((v) => {
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
    private readonly mistakeServ: MistakeService
  ) {
    console.log('BoardService Constructor');
    this.registerSubscriptions();
    this.historyServ.create();
    this.mistakeServ.create();
  }

  ngOnDestroy(): void {
    console.log('BoardService Destroy');
    this.unsubscribeSubscriptions();
    this.historyServ.destroy();
    this.mistakeServ.destroy();
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
      this.gameStartModeSub$,
      this.progressSub$,
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
        this.historyServ.add([{ board: clearedField, selectedField: this._selectedField }]);
        this.setBoard(clearedField);
        this.gameStateServ.onBoardFieldClick({ ...this._selectedField, ...{ value: 0, highlight: false } });
      }
    }

    if (featureClickEvent.feature === 'back') {
      from(this.historyServ.back()).subscribe((lastHistory) => {
        if (typeof lastHistory !== 'undefined') {
          this.setBoard(lastHistory.board);
          this.gameStateServ.onBoardFieldClick(lastHistory.selectedField);
        }
      });
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
          .selectFieldsByNumber(numberClickEvent.number, { isAnimated: false })
          .get()
      );
      this.historyServ.add([
        {
          board: new BoardBuilder({ board: this._board }).unselectAllFields().get(),
          selectedField: this._selectedField,
        },
      ]);
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
      this.historyServ.add([
        {
          board: new BoardBuilder({ board: this._board }).unselectAllFields().get(),
          selectedField: this._selectedField,
        },
      ]);
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

  private mistakeUpdateHandler(numberClickEvent: NumberClickEvent): void {
    if (numberClickEvent.mode === 'value') {
      if (!this.isCorrectValue(numberClickEvent.number)) {
        this.mistakeServ.add([
          {
            address: this._selectedField.address,
            value: numberClickEvent.number,
            finalValue: this._selectedField.finalValue,
          },
        ]);
      }
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

  private isCorrectValue(value: number): boolean {
    return this._selectedField.finalValue === value;
  }

  setDefaultSelectedField(): void {
    this.setBoard(this._board);
    this.setSelectedField(this._selectedField);
  }

  private gameStartModeHandler(mode: GameStartMode): void {
    switch (mode.type) {
      case GameStartType.CONTINUE:
        this.onContinueGame(mode);
        break;
      case GameStartType.NEW_GAME:
        this.onNewGame(mode);
        break;

      case GameStartType.RESTART_GAME:
        this.onRestartGame(mode);
        break;
    }
    this.gameStateServ.setPauseState(false);
  }

  private onContinueGame(mode: GameStartMode): void {
    console.log('=== Continue');
    this.defaultBaseBoard = new BoardBuilder({
      board: mode.gameState?.board,
      level: mode.gameState?.level,
    })
      .unselectAllFields()
      .setDefaultSelectedField();
    this.timerServ.start(mode.gameState?.timestring);
    this.historyServ.add(mode.gameState ? mode.gameState.history : []);
    this.mistakeServ.add(mode.gameState ? mode.gameState.mistakes : []);
  }

  private onNewGame(_mode: GameStartMode): void {
    console.log('=== New game');
    this.defaultBaseBoard = new BoardBuilder({
      level: this.gameStateServ.selectedLevel,
    }).setDefaultSelectedField();
    this.timerServ.start('00:00:00');
    this.historyServ.clear();
    this.mistakeServ.clear();
  }

  private onRestartGame(mode: GameStartMode): void {
    console.log('=== Restart game');
    this.timerServ.start('00:00:00');
    this.historyServ.clear();
    this.mistakeServ.clear();
    this.setBoard(
      new BoardBuilder({ level: this.gameStateServ.selectedLevel, board: this._board })
        .setDefaults()
        .setDefaultSelectedField()
        .get()
    );
  }
}
