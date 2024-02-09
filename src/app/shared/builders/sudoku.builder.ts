import { SudokuUtil } from '../utils/sudoku.util';
import { Grid, GridBuilder } from './grid.builder';

export class SudokuBuilder extends Grid<number> {
  private squareRoot: number;
  constructor(_squareRoot: number) {
    super();
    this.rows = _squareRoot;
    this.cols = _squareRoot;
    this.squareRoot = _squareRoot;
    this.grid = new GridBuilder<number>(_squareRoot, _squareRoot, 0).getGrid();
    return this;
  }

  getGrid(): number[][] {
    return this.grid;
  }

  private getBoardSquares(board: number[][] | string[][]): number[][][] {
    const squares: number[][][] = [];
    const sqrt = Math.sqrt(board.length);
    if (sqrt % 1 !== 0) {
      throw Error('Sqrt is not an integer.');
    }

    for (let row = 0; row < board.length; row += sqrt) {
      for (let col = 0; col < board.length; col += sqrt) {
        const square: number[][] = [];
        for (let k = row; k < row + sqrt; k++) {
          for (let l = col; l < col + sqrt; l++) {
            square.push([k, l]);
          }
        }
        squares.push(square);
      }
    }
    return squares;
  }

  randomizeDiagonal(): this {
    const newGrid = structuredClone(this.grid);
    const boardSquares: number[][][] = this.getBoardSquares(newGrid);

    let squares = [boardSquares[0], boardSquares[boardSquares.length - 1]];

    let diagonalIndex = 0;
    const diagonalSquaresCount = Math.sqrt(this.grid.length) - 2;

    const diagonalSquaresArr: number[][][] = Array.from({ length: diagonalSquaresCount }, (_, i) => i + 1).map(
      (item, index) => {
        diagonalIndex = diagonalIndex + (Math.sqrt(this.grid.length) + 1);
        return boardSquares[diagonalIndex];
        // if(Math.sqrt(board.length) > 3 &&
        //   Math.sqrt(board.length) % 1 === 0) {
        //     return boardSquares[diagonalIndex];
        //   } else {
        //     return boardSquares[diagonalIndex];
        //   }
      }
    );

    squares = [...squares, ...diagonalSquaresArr];
    squares.forEach((square) => {
      const values = SudokuUtil.shuffleArray(Array.from({ length: newGrid.length }, (_, i) => i + 1));
      for (let i = 0; i <= newGrid.length - 1; i++) {
        const row = square[i][0];
        const col = square[i][1];
        newGrid[row][col] = values[i];
      }
    });

    this.grid = newGrid;
    return this;
  }

  eraseSome(percentage: number): this {
    this.grid = SudokuUtil.eraseSome(this.grid, percentage);
    return this;
  }

  solveSudoku(): this {
    this.grid = SudokuUtil.solveSudoku(this.grid, this.squareRoot);
    return this;
  }
}
