import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Input, OnDestroy, OnInit } from '@angular/core';
import { NotesBuilder } from 'src/app/shared/builders/notes.builder';
import { GameLevel, GameStateService } from 'src/app/shared/services/game-state.service';
import { Address, Field } from './field/field.types';
import { Board } from './board.types';
import { SudokuUtil } from 'src/app/shared/utils/sudoku.util';
import { Subscription } from 'rxjs';
import { ControlsService, FeatureClickEvent, NumberClickEvent } from '../controls/controls.service';
import { InputMode } from 'src/app/shared/services/game-state.types';
import { BoardService } from './board.service';
import { HistoryService } from 'src/app/shared/services/history.service';
import { BoardBuilder } from 'src/app/shared/builders/board.builder';

@Component({
  selector: 'app-board',
  templateUrl: './board.component.html',
  styleUrls: ['./board.component.scss'],
  providers: [BoardService],
})
export class BoardComponent implements OnInit, OnDestroy {
  squareRoot!: number;

  inputMode: InputMode = 'value';
  level!: GameLevel;
  private _board: Board = [];

  private boardSub$: Subscription = this.boardServ.getBoard().subscribe((board) => {
    this._board = board;
    console.log('Board', this._board);
  });

  get board() {
    return this._board;
  }

  borderSquares: Array<Record<string, string>> = [];
  private selectedField!: Field;
  private inputModeSubs$: Subscription = this.gameStateServ.getInputMode$().subscribe((x) => (this.inputMode = x));

  private fieldClickSub$: Subscription = this.gameStateServ
    .getBoardFieldClick$()
    .subscribe((v) => this.onFieldClick(v));

  private numberClickSub$: Subscription = this.controlsServ
    .getNumberClick$()
    .subscribe((v) => {
      this.onNumberClick(v);
    });

  private featureClickSub$: Subscription = this.controlsServ
    .getFeatureClick$()
    .subscribe((v) => this.onFeatureClick(v));

  constructor(
    private gameStateServ: GameStateService,
    private controlsServ: ControlsService,
    private boardServ: BoardService,
    private historyServ: HistoryService
  ) {}

  ngOnInit() {
    this.loadLevelProperties();
    this.borderSquares = this.countBorderSquares(this.board);
    this.setDefaultSelectedField();
  }

  ngOnDestroy(): void {
    this.inputModeSubs$.unsubscribe();
    this.numberClickSub$.unsubscribe();
    this.fieldClickSub$.unsubscribe();
    this.featureClickSub$.unsubscribe();
    this.boardSub$.unsubscribe();
  }

  private countBorderSquares(board: Board): Array<Record<string, string>> {
    const obj: Array<Record<string, string>> = [];
    const squares = SudokuUtil.getBoardSquares(SudokuUtil.toNumericBoard(board, 'value'));
    const sqrt = Math.sqrt(squares.length);

    squares.forEach((row, rowIndex) => {
      row.forEach((col, colIndex) => {
        if (colIndex !== 0 && colIndex % sqrt === 0) {
          obj.push({ left: `${rowIndex},${colIndex}` });
        }

        if (rowIndex !== 0 && rowIndex % sqrt === 0) {
          obj.push({ top: `${rowIndex},${colIndex}` });
        }

        if (rowIndex % sqrt !== 0) {
          obj.push({ internalTop: `${rowIndex},${colIndex}` });
        }

        if (colIndex % sqrt !== 0) {
          obj.push({ internalLeft: `${rowIndex},${colIndex}` });
        }
      });
    });

    return obj;
  }

  getBorderSquareForAddr(address: Address): string[] {
    return this.borderSquares
      .filter((f) => Object.values(f).includes(`${address.row},${address.col}`))
      .map((i) => Object.keys(i).toString());
  }

  trackFieldByAddress(index: number, item: Field): string {
    return `${item.address.row}${item.address.col}`;
  }

  private onFeatureClick(featureClickEvent: FeatureClickEvent): void {
    if (featureClickEvent.feature === 'notes') {
      this.gameStateServ.setInputMode(this.inputMode === 'value' ? 'notes' : 'value');
    }

    if (featureClickEvent.feature === 'erase') {
      const addr: Address = this.selectedField.address;
      const isUserValue = this.board[addr.row][addr.col].isInitialValue === false;
      if (isUserValue) {
        const clearedField = new BoardBuilder({board: this.board}).unselectAllFields().eraseField(addr).get();
        this.historyServ.add(clearedField, this.selectedField);
        this.boardServ.setBoard(clearedField);
        this.gameStateServ.onBoardFieldClick({ ...this.selectedField, ...{ value: 0, highlight: false } });
      }
    }

    if (featureClickEvent.feature === 'back') {
      const lastHistory = this.historyServ.back();
      if (typeof lastHistory !== 'undefined') {
        this.boardServ.setBoard(lastHistory.board);
        this.gameStateServ.onBoardFieldClick(lastHistory.selectedField);
      }
    }
  }

  private onNumberClick(numberClickEvent: NumberClickEvent): void {
    const notInitialValue = !this.selectedField.isInitialValue;
    const notCorrectValue = !this.board[this.selectedField.address.row][this.selectedField.address.col].isCorrectValue;
    const notNotesMode = this.inputMode !== 'notes';
    if (notInitialValue && notCorrectValue && notNotesMode) {
      this.boardServ.setBoard(
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
      this.boardServ.setBoard(
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
      this.boardServ.setBoard(
        new BoardBuilder({ board: this.board })
          .unselectAllFields()
          .highlightFields(field.address)
          .selectFieldsByNumber(field.value)
          .get()
      );
      this.selectedField = field;
    } else {
      this.boardServ.setBoard(
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

  private isFieldNotEmpty(value: number): boolean {
    return value !== 0;
  }

  private setDefaultSelectedField(): void {
    const board = new BoardBuilder({ board: this.board }).setDefaultSelectedField().get();
    this.boardServ.setBoard(board);
    this.selectedField = board.flat().filter((f) => f.selected === true)[0];
  }

  loadLevelProperties(): void {
    this.level = this.gameStateServ.selectedLevel;
    this.squareRoot = this.level.cols;
    this.setBoardSize(this.squareRoot);
  }

  private setBoardSize(size: number): void {
    document.documentElement.style.setProperty('--board-size', size.toString());
  }
}
