import { SudokuUtil } from "src/app/shared/utils/sudoku.util";
import { Address, Field } from "./field/field.types";

export type Board = Field[][];

export class NewBoard {
  private _board: Board;
  constructor(board: Board) {
    this._board = board;
    return this;
  }

  updateFieldInBoard(partialField: { address: Address} & Partial<Field>): this {
    this._board = structuredClone(this._board).map(row => {
      return row.map(field => {
        return this.isAddressEqual(field.address, partialField.address) ? {
          ...field,
          ...partialField
        } : field;
      })
    })

    return this;
  }

  selectFieldsByNumber(value: number): this {
    const address = this.getFieldsByNumber(value).map(x => x.address);
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

  // getField(address: Address): Field {
  //   // return this._board.
  // }

  isAddressEqual(sourceAddress: Address, destAddress: Address): boolean {
    return sourceAddress.row === destAddress.row && sourceAddress.col === destAddress.col;
  }

  setDefaultSelectedField(): this {
    const random = this.getRandomEmptyFieldAddress(this._board);
    // this.boardServ.setBoard(this.highlightFields(this.board, this.board[random.row][random.col].address));
    this._board = structuredClone(this._board).map(row => {
      return row.map(field => {
        if(this.isAddressEqual(field.address, random)) {
          return {
            ...field,
            ...{ selected: true }
          }
        }

        return field;
      })
    })

    return this;
    // this.board[random.row][random.col].selected = true;
    // this.selectedField = this.board[random.row][random.col];
  }

  private getRandomEmptyFieldAddress(board: Board): Address {
    const address = {
      row: Math.floor(Math.random() * board.length),
      col: Math.floor(Math.random() * board.length),
    };
    return board[address.row][address.col].value === 0 ? address : this.getRandomEmptyFieldAddress(board);
  }
}


export type BoardSet = {
  initial: Board;
  final: number[][];
}

export type SudokuGridSet = {
  initial: number[][];
  final: number[][];
}

export type MissingNumber = {
  id: number,
  value: number,
}
