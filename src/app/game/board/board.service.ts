import { Injectable, OnDestroy } from '@angular/core';
import { SudokuUtil } from 'src/app/shared/utils/sudoku.util';
import { Board } from './board.types';
import { GameStateService } from 'src/app/shared/services/game-state.service';
import { Address, Field } from './field/field.types';
import { BehaviorSubject, Observable, Subscription, combineLatest, from, map, tap, withLatestFrom } from 'rxjs';
import { BoardBuilder } from 'src/app/shared/builders/board.builder';
import {
  ControlsService,
  FeatureClickEvent,
  NumberClickEvent,
  NumberClickEventSource,
} from '../controls/controls.service';
import {
  BurstModeType,
  GameStartMode,
  GameStartType,
  GameStatusType,
  InputModeType,
} from 'src/app/shared/services/game-state.types';
import { HistoryService } from 'src/app/shared/services/history.service';
import { NotesBuilder } from 'src/app/shared/builders/notes.builder';
import { TimerService } from 'src/app/shared/services/timer.service';
import { MistakeService, PresentMistake } from 'src/app/shared/services/mistake.service';
import { BaseService } from 'src/app/shared/abstracts/base-service.abstract';
import { ScoreService } from 'src/app/shared/services/score.service';

@Injectable()
export class BoardService extends BaseService implements OnDestroy {
  private readonly gameStartModeSub$: Subscription = this.gameStateServ
    .getGameStartMode$()
    .pipe(
      tap((_) => {
        this.gameStartModeHandler(_);
      })
    )
    .subscribe();

  private defaultBaseBoard!: BoardBuilder;

  private inputMode: InputModeType = InputModeType.VALUE;
  private burstMode: BurstModeType = BurstModeType.NORMAL;
  private _selectedField!: Field;
  private _board!: Board;

  private readonly selectedField$ = new BehaviorSubject<Field>(this.defaultBaseBoard.getSelectedFields()[0]);
  private readonly board$ = new BehaviorSubject<Board>(this.defaultBaseBoard.get());

  private boardSub$: Subscription = combineLatest([this.mistakeServ.getPresentMistakes(), this.getBoard$()])
    .pipe(map(([p, b]) => b))
    .subscribe((v) => {
      this._board = v;
    });

  private progressSub$: Subscription = combineLatest([
    this.getBoard$(),
    this.mistakeServ.getPresentMistakes(),
    this.getSelectedField$(),
    this.historyServ.get$(),
    this.timerServ.getTimestring(),
    this.mistakeServ.get$(),
    this.scoreServ.getPresentScore(),
  ])
    .pipe(
      map(([board, presentMistake, field, history, timestring, mistake, score]) => {
        return { board, presentMistake, field, history, timestring, mistake, score };
      })
    )
    .pipe(
      map((x) => ({
        ...x,
        state: this.statusRecognize(x.presentMistake, x.board),
      }))
    )
    .pipe(tap((_) => this.gameStateServ.setGameStatus(_.state)))
    .subscribe((v) => {
      this.gameStateServ.setGameState({
        board: v.board,
        selectedField: v.field,
        history: v.history,
        level: this.gameStateServ.selectedLevel,
        timestring: v.timestring,
        mistakes: v.mistake,
        state: v.state,
        score: v.score,
      });
    });

  private statusRecognize(presentMistake: PresentMistake, board: Board): GameStatusType {
    if (presentMistake.limit !== 0 && presentMistake.value >= presentMistake.limit) {
      return GameStatusType.LOSS;
    } else if (board.flat().every((x) => x.isCorrectValue)) {
      return GameStatusType.VICTORY;
    } else {
      return GameStatusType.PENDING;
    }
  }

  private selectedFieldSub$: Subscription = this.getSelectedField$().subscribe((field) => {
    this._selectedField = field;
  });

  private inputInterractionSub$: Subscription = combineLatest([
    this.gameStateServ.getInputMode$(),
    this.gameStateServ.getBurstMode$(),
  ]).subscribe(([input, burst]) => {
    this.inputMode = input;
    this.burstMode = burst;
  });

  private fieldClickSub$: Subscription = this.gameStateServ
    .getBoardFieldClick$()
    .pipe(withLatestFrom(this.gameStateServ.getSelectedBurstNumber$()))
    .subscribe(([f, n]) => {
      this.onFieldClick(f);
      if (this.burstMode === BurstModeType.BURST) {
        this.controlsServ.onNumberClick({
          source: NumberClickEventSource.FIELD,
          mode: this.inputMode,
          number: n ? n : 1,
        });
      }
    });

  private numberClickSub$: Subscription = this.controlsServ
    .getNumberClick$()
    .pipe(
      tap((_) => {
        if (
          this.burstMode === BurstModeType.NORMAL ||
          (this.burstMode === BurstModeType.BURST && _.source === NumberClickEventSource.FIELD)
        ) {
          this.mistakeUpdateHandler(_);
          this.onNumberClick(_);
        } else if (this.burstMode === BurstModeType.BURST && _.source === NumberClickEventSource.NUMBER) {
          this.gameStateServ.setSelectedBurstNumber(_.number);
        }
      })
    )
    .subscribe();

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
    private readonly mistakeServ: MistakeService,
    private readonly scoreServ: ScoreService
  ) {
    super();
    this.registerSubscriptions([
      this.boardSub$,
      this.inputInterractionSub$,
      this.fieldClickSub$,
      this.numberClickSub$,
      this.featureClickSub$,
      this.selectedFieldSub$,
      this.gameStartModeSub$,
      this.progressSub$,
    ]);
    this.historyServ.create();
    this.mistakeServ.create();
    this.scoreServ.create();
  }

  ngOnDestroy(): void {
    this.unsubscribeSubscriptions();
    this.historyServ.destroy();
    this.mistakeServ.destroy();
    this.scoreServ.destroy();
  }

  private onFeatureClick(featureClickEvent: FeatureClickEvent): void {
    if (featureClickEvent.feature === 'notes') {
      this.gameStateServ.setInputMode(
        this.inputMode === InputModeType.VALUE ? InputModeType.NOTES : InputModeType.VALUE
      );
    }

    if (featureClickEvent.feature === 'burst') {
      this.gameStateServ.setBurstMode(
        this.burstMode === BurstModeType.NORMAL ? BurstModeType.BURST : BurstModeType.NORMAL
      );
    }

    if (featureClickEvent.feature === 'erase') {
      const addr: Address = this._selectedField.address;
      const isUserValue = this.board[addr.row][addr.col].isInitialValue === false;
      if (isUserValue) {
        const clearedField = new BoardBuilder({ board: this.board }).unselectAllFields().eraseField(addr).get();
        this.historyServ.add([{ board: clearedField, selectedField: this._selectedField }]);
        this.setBoard(clearedField);
        this.setSelectedField({ ...this._selectedField, value: 0, notes: new NotesBuilder().get() });
        this.gameStateServ.onBoardFieldClick({ ...this._selectedField, ...{ value: 0, highlight: false } });
      }
    }

    if (featureClickEvent.feature === 'back') {
      from(this.historyServ.back()).subscribe((lastHistory) => {
        if (typeof lastHistory !== 'undefined') {
          this.setBoard(new BoardBuilder({ board: lastHistory.board }).replaceProperty(this._board, 'score').get());
          this.gameStateServ.onBoardFieldClick(lastHistory.selectedField);
        }
      });
    }
  }

  private onNumberClick(numberClickEvent: NumberClickEvent): void {
    const notInitialValue = !this._selectedField.isInitialValue;
    const notCorrectValue =
      !this.board[this._selectedField.address.row][this._selectedField.address.col].isCorrectValue;
    const notNotesMode = this.inputMode !== InputModeType.NOTES;
    if (notInitialValue && notCorrectValue && notNotesMode) {
      this.setBoard(
        new BoardBuilder({ board: this._board })
          .unselectAllFields()
          .updateFieldInBoard({ address: this._selectedField.address, value: numberClickEvent.number })
          .updateScore(this._selectedField.address, this.gameStateServ.selectedLevel.scoreMultiplier)
          .highlightFields(this._selectedField.address)
          .selectFieldsByNumber(numberClickEvent.number, { isAnimated: false })
          .get()
      );
      this.scoreServ.set([this._board.flat().reduce((prev, curr) => prev + curr.score.score, 0)]);
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
    if (numberClickEvent.mode === InputModeType.VALUE) {
      if (
        !this.isCorrectValue(numberClickEvent.number) &&
        !this.isCorrectValue(this._selectedField.value) &&
        !this._selectedField.isInitialValue
      ) {
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
    this.defaultBaseBoard = new BoardBuilder({
      board: mode.gameState?.board,
      level: mode.gameState?.level,
    })
      .unselectAllFields()
      .setDefaultSelectedField();
    this.timerServ.start(mode.gameState?.timestring);
    this.historyServ.add(mode.gameState ? mode.gameState.history : []);
    this.mistakeServ.add(mode.gameState ? mode.gameState.mistakes : []);
    this.scoreServ.add(mode.gameState ? [mode.gameState.score] : []);
  }

  private onNewGame(_mode: GameStartMode): void {
    this.defaultBaseBoard = new BoardBuilder({
      level: this.gameStateServ.selectedLevel,
    }).setDefaultSelectedField();
    this.timerServ.start('00:00:00');
    this.historyServ.clear();
    this.mistakeServ.clear();
    this.scoreServ.clear();
  }

  private onRestartGame(mode: GameStartMode): void {
    this.timerServ.start('00:00:00');
    this.historyServ.clear();
    this.mistakeServ.clear();
    this.scoreServ.clear();
    this.setBoard(
      new BoardBuilder({ level: this.gameStateServ.selectedLevel, board: this._board })
        .setDefaults()
        .setDefaultSelectedField()
        .get()
    );
  }
}
