import { Board, SudokuGridSet } from 'src/app/game/board/board.types';
import { GridBuilder } from './grid.builder';
import { Address, Field } from 'src/app/game/board/field/field.types';
import { NotesBuilder } from './notes.builder';
import { SudokuUtil } from '../utils/sudoku.util';
import { GameLevel, Levels } from '../services/game-state.service';
import { SudokuBuilder } from './sudoku.builder';
import { ScoreBuilder } from './score.builder';

export class BoardBuilder {
  private _board: Board;
  private _sudokuGrids!: SudokuGridSet;

  constructor(payload: { board?: Board; level?: GameLevel } = {}) {
    if (typeof payload.board === 'undefined') {
      payload.level = typeof payload.level === 'undefined' ? new GameLevel(Levels.EASY) : payload.level;
      this._sudokuGrids = this.createSudokuGridSet(payload.level.givenNumbers, payload.level.rows);
      this._board = new GridBuilder<Field>(payload.level.rows, payload.level.cols, {
        value: 0,
        finalValue: 0,
        notes: new NotesBuilder().get(),
        address: { row: 0, col: 0 },
        selected: false,
        highlight: false,
        isInitialValue: false,
        isAnimated: true,
        scoreable: false,
        score: {
          score: 0,
          scored: false,
        },
      }).getGrid();

      for (let row = 0; row <= payload.level.rows - 1; row++) {
        for (let col = 0; col <= payload.level.cols - 1; col++) {
          const sudokuValue = this._sudokuGrids.initial[row][col];
          this._board[row][col].finalValue = this._sudokuGrids.final[row][col];
          this._board[row][col].value = sudokuValue;
          this._board[row][col].isInitialValue = sudokuValue === 0 ? false : true;
          this._board[row][col].address = { row: row, col: col };
          this._board[row][col].isCorrectValue = sudokuValue > 0;
          this._board[row][col].scoreable = sudokuValue === 0;
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

  getGridset(): SudokuGridSet {
    return this._sudokuGrids;
  }

  updateFieldInBoard(partialField: { address: Address } & Partial<Field>): this {
    this._board = structuredClone(this._board).map((row) => {
      return row.map((field) => {
        const mergedField: Field = { ...field, ...partialField };
        return this.isAddressEqual(field.address, partialField.address)
          ? {
              ...mergedField,
              ...{ isCorrectValue: this.isCorrectValue(mergedField.value, mergedField.address) },
            }
          : field;
      });
    });
    return this;
  }

  updateScore(address: Address, multiplier: number): this {
    const field = this._board[address.row][address.col];
    this.updateFieldInBoard({
      address,
      score: new ScoreBuilder(field.score, field.isCorrectValue as boolean, multiplier).get(),
    });
    return this;
  }

  eraseField(address: Address): this {
    this.updateFieldInBoard({
      address,
      ...{
        value: 0,
        notes: new NotesBuilder().get(),
        isCorrectValue: false,
      },
    });
    return this;
  }

  selectFieldsByNumber(value: number, options: { isAnimated: boolean } = { isAnimated: true }): this {
    const address = this.getFieldsByNumber(value).map((x) => x.address);
    this._board = structuredClone(this._board).map((row) => {
      return row.map((field) => {
        if (address.some((x) => this.isAddressEqual(field.address, x))) {
          field.selected = true;
          field.isAnimated = options.isAnimated;
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

  getSelectedFields(): Field[] {
    return structuredClone(this._board)
      .flat()
      .filter((x) => x.selected);
  }

  unselectAllFields(exceptAddress?: Address): this {
    const exceptAddr = (source: Address | undefined, dest: Address) => {
      if (typeof source == 'undefined') {
        return false;
      }
      return this.isAddressEqual(source, dest);
    };

    this._board = structuredClone(this._board).map((row) => {
      return row.map((field) => {
        field.selected = exceptAddr(exceptAddress, field.address);
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

  get(): Board {
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
    this.highlightFields(random);
    return this;
  }

  setDefaults(): this {
    this._board = structuredClone(this._board).map((row) => {
      return row.map((field) => {
        return {
          ...field,
          ...{
            isAnimated: false,
            isCorrectValue: field.isInitialValue ? true : false,
            notes: new NotesBuilder().get(),
            value: field.isInitialValue ? field.finalValue : 0,
            highlight: false,
            selected: false,
            score: new ScoreBuilder(),
          },
        };
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

  private isCorrectValue(value: number, addr: Address): boolean {
    const foundField = this._board.flat().find((i) => {
      return this.isAddressEqual(i.address, addr);
    }) as Field;
    return foundField.isInitialValue
      ? (foundField.isCorrectValue as boolean)
      : this._board[addr.row][addr.col].finalValue === value;
  }
}
