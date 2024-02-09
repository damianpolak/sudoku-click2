export class SudokuUtil {
  private constructor() {}

  static isSafe(board: number[][], row: number, col: number, num: number): boolean {
    for (let d = 0; d < board.length; d++) {
      if (board[row][d] == num) {
        return false;
      }
    }

    for (let r = 0; r < board.length; r++) {
      if (board[r][col] == num) {
        return false;
      }
    }

    const sqrt = Math.floor(Math.sqrt(board.length));
    const boxRowStart = row - (row % sqrt);
    const boxColStart = col - (col % sqrt);

    for (let r = boxRowStart; r < boxRowStart + sqrt; r++) {
      for (let d = boxColStart; d < boxColStart + sqrt; d++) {
        if (board[r][d] == num) {
          return false;
        }
      }
    }

    return true;
  }

  static solveSudoku(board: number[][], n: number): number[][] {
    let row = -1;
    let col = -1;
    let isEmpty = true;
    for (let i = 0; i < n; i++) {
      for (let j = 0; j < n; j++) {
        if (board[i][j] == 0) {
          row = i;
          col = j;

          isEmpty = false;
          break;
        }
      }
      if (!isEmpty) {
        break;
      }
    }

    if (isEmpty) {
      return board;
    }

    for (let num = 1; num <= n; num++) {
      if (this.isSafe(board, row, col, num)) {
        board[row][col] = num;
        if (this.solveSudoku(board, n).length > 0) {
          return board;
        } else {
          board[row][col] = 0;
        }
      }
    }
    return [];
  }

  static shuffleArray(array: any[]): any[] {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      const temp = array[i];
      array[i] = array[j];
      array[j] = temp;
    }
    return array;
  }
}
