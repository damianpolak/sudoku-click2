import { Board, SudokuGridSet } from 'src/app/game/board/board.types';
import { GridBuilder } from './grid.builder';
import { Address, Field } from 'src/app/game/board/field/field.types';
import { NotesBuilder } from './notes.builder';
import { SudokuUtil } from '../utils/sudoku.util';
import { GameLevel, Levels } from '../services/game-state.service';
import { SudokuBuilder } from './sudoku.builder';

// type BoardBuild = {
//   board?: Board;
//   level: GameLevel;
// }

export class BoardBuilder {
  private _board: Board;
  private _sudokuGrids!: SudokuGridSet;

  constructor(payload: { board?: Board, level?: GameLevel} = {}) {
    if (typeof payload.board === 'undefined') {
      payload.level = typeof payload.level === 'undefined' ? new GameLevel(Levels.EASY) : payload.level;
      this._sudokuGrids = this.createSudokuGridSet(payload.level.givenNumbers, payload.level.rows);
      this._board = new GridBuilder<Field>(payload.level.rows, payload.level.cols, {
        value: 0,
        notes: new NotesBuilder().get(),
        address: { row: 0, col: 0 },
        selected: false,
        highlight: false,
        initialValue: false,
      }).getGrid();

      for (let row = 0; row <= payload.level.rows - 1; row++) {
        for (let col = 0; col <= payload.level.cols - 1; col++) {
          const sudokuValue = this._sudokuGrids.initial[row][col];
          this._board[row][col].value = sudokuValue;
          this._board[row][col].initialValue = sudokuValue === 0 ? false : true;
          this._board[row][col].address = { row: row, col: col };
          this._board[row][col].isCorrectValue = sudokuValue > 0;
        }
      }
    } else {
      this._board = payload.board;
    }
    return this;
  }

  private createSudokuGridSet(givenNumbers: number, size: number): SudokuGridSet {
    const grid: number[][] = new SudokuBuilder(size).randomizeDiagonal().solveSudoku().getGrid();
    return {
      initial: SudokuUtil.eraseSome(grid, givenNumbers),
      final: grid,
    };
  }

  getSudokuGridSet(): SudokuGridSet {
    return this._sudokuGrids;
  }

  updateFieldInBoard(partialField: { address: Address } & Partial<Field>): this {
    this._board = structuredClone(this._board).map((row) => {
      return row.map((field) => {
        return this.isAddressEqual(field.address, partialField.address)
          ? {
              ...field,
              ...partialField,
            }
          : field;
      });
    });
    return this;
  }

  selectFieldsByNumber(value: number): this {
    const address = this.getFieldsByNumber(value).map((x) => x.address);
    this._board = structuredClone(this._board).map((row) => {
      return row.map((field) => {
        if (address.some((x) => this.isAddressEqual(field.address, x))) {
          field.selected = true;
        }
        return field;
      });
    });
    return this;
  }

  protected getFieldsByNumber(value: number): Field[] {
    return structuredClone(this._board)
      .flat()
      .filter((x) => x.value === value);
  }

  unselectAllFields(): this {
    this._board = structuredClone(this._board).map((row) => {
      return row.map((field) => {
        field.selected = false;
        field.highlight = false;
        return field;
      });
    });
    return this;
  }

  highlightFields(selected: Address): this {
    const boardSquares = SudokuUtil.getBoardSquares(SudokuUtil.toNumericBoard(this._board, 'value'));
    const selectedSquareAddr = boardSquares.filter((f) => {
      return f.some((x) => x[0] === selected.row && x[1] === selected.col);
    })[0];

    this._board = structuredClone(this._board).map((row) => {
      return row.map((field) => {
        const crossed = selected.row === field.address.row || selected.col === field.address.col;
        const square = selectedSquareAddr.some(
          (addr) => addr[0] === field.address.row && addr[1] === field.address.col
        );
        field.highlight = crossed || square ? true : false;
        return field;
      });
    });
    return this;
  }

  getBoard(): Board {
    return this._board;
  }

  isAddressEqual(sourceAddress: Address, destAddress: Address): boolean {
    return sourceAddress.row === destAddress.row && sourceAddress.col === destAddress.col;
  }

  setDefaultSelectedField(): this {
    const random = this.getRandomEmptyFieldAddress(this._board);
    this._board = structuredClone(this._board).map((row) => {
      return row.map((field) => {
        if (this.isAddressEqual(field.address, random)) {
          return {
            ...field,
            ...{ selected: true },
          };
        }
        return field;
      });
    });
    return this;
  }

  private getRandomEmptyFieldAddress(board: Board): Address {
    const address = {
      row: Math.floor(Math.random() * board.length),
      col: Math.floor(Math.random() * board.length),
    };
    return board[address.row][address.col].value === 0 ? address : this.getRandomEmptyFieldAddress(board);
  }
}
