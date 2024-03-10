import { Component, OnDestroy, OnInit } from '@angular/core';
import { GameLevel, GameStateService } from 'src/app/shared/services/game-state.service';
import { Address, Field } from './field/field.types';
import { Board } from './board.types';
import { SudokuUtil } from 'src/app/shared/utils/sudoku.util';
import { Subscription } from 'rxjs';
import { BoardService } from './board.service';

@Component({
  selector: 'app-board',
  templateUrl: './board.component.html',
  styleUrls: ['./board.component.scss'],
  providers: [BoardService],
})
export class BoardComponent implements OnInit, OnDestroy {
  private _board: Board = [];
  private level!: GameLevel;
  private borderSquares: Array<Record<string, string>> = [];

  private boardSub$: Subscription = this.boardServ.getBoard$().subscribe((board) => {
    this._board = board;
    // console.log('Board', this._board);
  });

  get board() {
    return this._board;
  }

  constructor(private gameStateServ: GameStateService, private boardServ: BoardService) {}

  ngOnInit() {
    this.loadLevelProperties();
    this.borderSquares = this.countBorderSquares(this.board);
    setTimeout(() => {
      this.boardServ.setDefaultSelectedField();
    })
  }

  ngOnDestroy(): void {
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

  private loadLevelProperties(): void {
    this.level = this.gameStateServ.selectedLevel;
    this.setBoardSize(this.level.cols);
  }

  private setBoardSize(size: number): void {
    document.documentElement.style.setProperty('--board-size', size.toString());
  }
}
