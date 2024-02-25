import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Input, OnDestroy, OnInit } from '@angular/core';
import { NotesBuilder } from 'src/app/shared/builders/notes.builder';
import { GameLevel, GameStateService } from 'src/app/shared/services/game-state.service';
import { Address, Field } from './field/field.types';
import { SudokuBuilder } from 'src/app/shared/builders/sudoku.builder';
import { GridBuilder } from 'src/app/shared/builders/grid.builder';
import { Board, BoardSet } from './board.types';
import { SudokuUtil } from 'src/app/shared/utils/sudoku.util';
import { BehaviorSubject, Observable, Subscription, tap } from 'rxjs';
import { ControlsService, FeatureClickEvent, NumberClickEvent } from '../controls/controls.service';
import { InputMode } from 'src/app/shared/services/game-state.types';
import { BoardService } from './board.service';

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
  private _boardFinal: number[][] = [];

  private boardSub$: Subscription = this.boardServ.getBoard().subscribe((board) => (this._board = board));
  private boardFinal$: Subscription = this.boardServ.getBoardFinal$().subscribe((board) => (this._boardFinal = board));

  get board() {
    return this._board;
  }

  borderSquares: Array<Record<string, string>> = [];
  private selectedField!: Field;
  private inputModeSubs$: Subscription = this.gameStateServ.getInputMode$().subscribe((x) => (this.inputMode = x));

  private fieldClickSub$: Subscription = this.gameStateServ
    .getBoardFieldClick$()
    .pipe(
      tap((_) => {
        this.boardServ.setBoard(this.unselectAllFields(this.board));
      })
    )
    .subscribe((v) => this.onFieldClick(v));

  private numberClickSub$: Subscription = this.controlsServ
    .getNumberClick$()
    .pipe(
      tap((clickEvent) => {
        const notInitialValue = !this.selectedField.initialValue;
        const notCorrectValue =
          !this.board[this.selectedField.address.row][this.selectedField.address.col].isCorrectValue;
        const notNotesMode = this.inputMode !== 'notes';

        if (notInitialValue && notCorrectValue && notNotesMode) {
          this.onNumberClick(clickEvent);
          this.boardServ.setBoard(this.unselectAllFields(this.board));
          this.onFieldClick({
            ...this.selectedField,
            ...{ value: clickEvent.number },
          });
        } else if (!notNotesMode) {
          this.onNumberClick(clickEvent);
        }
      })
    )
    .subscribe();

  private featureClickSub$: Subscription = this.controlsServ
    .getFeatureClick$()
    .subscribe((v) => this.onFeatureClick(v));

  constructor(
    private gameStateServ: GameStateService,
    private controlsServ: ControlsService,
    private boardServ: BoardService
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
    this.boardFinal$.unsubscribe();
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
      const addr: Address = {
        row: this.selectedField.address.row,
        col: this.selectedField.address.col,
      };

      const isUserValue = this.board[addr.row][addr.col].initialValue === false;
      if (isUserValue) {
        this.board[addr.row][addr.col] = {
          ...this.board[addr.row][addr.col],
          ...{ value: 0, notes: new NotesBuilder().get() },
        };
      }
    }
  }

  private onNumberClick(numberClickEvent: NumberClickEvent): void {
    const updateBoard = (board: Board) => {
      this.boardServ.setBoard(this.selectedField.initialValue === false ? board : this.board);
    };
    switch (this.inputMode) {
      case 'value':
        updateBoard(this.updateNumberValue(this.board, numberClickEvent.number, this.selectedField.address));
        break;
      case 'notes':
        updateBoard(this.updateNotesValue(this.board, numberClickEvent.number, this.selectedField.address));
        break;
    }
  }

  private onFieldClick(field: Field): void {
    this.boardServ.setBoard(this.highlightFields(this.board, field.address));
    if (field.value !== 0) {
      const fields = this.getAllFieldsWithNumber(this.board, field.value).map((i) => i.address);
      this.boardServ.setBoard(this.selectFieldsByAddress(this.board, fields));
      this.selectedField = field;
    } else {
      this.board[field.address.row][field.address.col].selected = field.selected;
      this.selectedField = field;
    }
  }

  private setDefaultSelectedField(): void {
    const random = this.getRandomEmptyFieldAddress();
    this.boardServ.setBoard(this.highlightFields(this.board, this.board[random.row][random.col].address));
    this.board[random.row][random.col].selected = true;
    this.selectedField = this.board[random.row][random.col];
  }

  private getRandomEmptyFieldAddress(): Address {
    const address = {
      row: Math.floor(Math.random() * this.level.rows),
      col: Math.floor(Math.random() * this.level.cols),
    };
    return this.board[address.row][address.col].value === 0 ? address : this.getRandomEmptyFieldAddress();
  }

  private getAllFieldsWithNumber(board: Board, value: number): Field[] {
    return structuredClone(board)
      .flat()
      .filter((x) => x.value === value);
  }

  private selectFieldsByAddress(board: Board, address: Address[]): Board {
    return structuredClone(board).map((row) => {
      return row.map((field) => {
        if (address.some((x) => this.boardServ.isAddressEqual(field.address, x))) {
          field.selected = true;
        }
        return field;
      });
    });
  }

  private updateNumberValue(board: Board, value: number, selectedFieldAddr: Address): Board {
    return structuredClone(board).map((row) =>
      row.map((field) => {
        if (this.boardServ.isAddressEqual(field.address, selectedFieldAddr)) {
          field.value = value;
          field.isCorrectValue = this.isValueCorrect(board, value, selectedFieldAddr);
        }
        // field.value = this.boardServ.isAddressEqual(field.address, selectedFieldAddr) ? value : field.value;
        // field.isCorrectValue = this.boardServ.isAddressEqual(field.address, selectedFieldAddr) ? this.isValueCorrect(board, value, selectedFieldAddr) : field.isCorrectValue;
        return structuredClone(field);
      })
    );
  }

  private isValueCorrect(board: Board, value: number, addr: Address): boolean {
    const foundField = structuredClone(board)
      .flat()
      .find((i) => {
        return this.boardServ.isAddressEqual(i.address, addr);
      }) as Field;
    return foundField.initialValue
      ? (foundField.isCorrectValue as boolean)
      : this._boardFinal[addr.row][addr.col] === value;
  }

  private updateNotesValue(board: Board, value: number, selectedAddress: Address): Board {
    return structuredClone(board).map((row) =>
      row.map((field) => {
        if (this.boardServ.isAddressEqual(field.address, selectedAddress)) {
          const currentNotesValues: number[] = field.notes.filter((f) => f.active).map((i) => i.value);
          if (currentNotesValues.includes(value)) {
            field.notes = new NotesBuilder([
              ...field.notes
                .filter((f) => f.active)
                .map((i) => i.value)
                .filter((f) => f !== value),
            ]).get();
          } else {
            field.notes = new NotesBuilder([
              ...field.notes.filter((f) => f.active).map((i) => i.value),
              ...[value],
            ]).get();
          }
        }
        return field;
      })
    );
  }

  private unselectAllFields(board: Board): Board {
    return structuredClone(board).map((row) => {
      return row.map((field) => {
        field.selected = false;
        field.highlight = false;
        return field;
      });
    });
  }

  private highlightFields(board: Board, selected: Address): Board {
    const boardSquares = SudokuUtil.getBoardSquares(SudokuUtil.toNumericBoard(structuredClone(board), 'value'));
    const selectedSquareAddr = boardSquares.filter((f) => {
      return f.some((x) => x[0] === selected.row && x[1] === selected.col);
    })[0];

    return structuredClone(board).map((row) => {
      return row.map((field) => {
        const crossed = selected.row === field.address.row || selected.col === field.address.col;
        const square = selectedSquareAddr.some(
          (addr) => addr[0] === field.address.row && addr[1] === field.address.col
        );
        field.highlight = crossed || square ? true : false;
        return field;
      });
    });
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
