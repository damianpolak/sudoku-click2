import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Input, OnDestroy, OnInit } from '@angular/core';
import { NotesBuilder } from 'src/app/shared/builders/notes.builder';
import { GameLevel, GameStateService } from 'src/app/shared/services/game-state.service';
import { Address, Field } from './field/field.types';
import { SudokuBuilder } from 'src/app/shared/builders/sudoku.builder';
import { GridBuilder } from 'src/app/shared/builders/grid.builder';
import { Board, BoardSet } from './board.types';
import { SudokuUtil } from 'src/app/shared/utils/sudoku.util';
import { BehaviorSubject, Observable, Subscription, tap } from 'rxjs';

@Component({
  selector: 'app-board',
  templateUrl: './board.component.html',
  styleUrls: ['./board.component.scss'],
})
export class BoardComponent implements OnInit, OnDestroy {
  squareRoot!: number;
  @Input() mode: boolean = false;

  level!: GameLevel;
  board: Board = [];

  private testBoardSubs$!: Subscription;
  private testFieldSubs$!: Subscription;
  testBoard: Board = [];

  constructor(private gameStateServ: GameStateService) {}

  ngOnInit() {
    this.loadLevelProperties();
    this.board = this.createBoardSet().initial;

    this.testFieldSubs$ = this.gameStateServ
      .getFieldBoard$()
      .pipe(
        tap((_) => {
          console.log(`tap:`, _.address);
          this.unselectAllFields();
        })
      )
      .subscribe({
        next: (v) => {
          this.highlightFields(v.address);
          this.board[v.address.row][v.address.col].selected = v.selected;
          this.gameStateServ.updateBoard(this.board);
        },
      });

    this.testBoardSubs$ = this.gameStateServ.getTestBoard$().subscribe({
      next: (v) => {
        this.testBoard = v;
        // console.log('Next', v);
      },
      complete: () => {
        console.log('Complete');
      },
    });

    this.gameStateServ.updateBoard(this.createBoardSet().initial);
    console.log(this.board);
  }

  ngOnDestroy(): void {
    this.testBoardSubs$.unsubscribe();
  }

  private unselectAllFields(): void {
    this.board = this.board.map((row) => {
      return row.map((field) => {
        field.selected = false;
        field.highlight = false;
        return field;
      });
    });
  }

  private highlightFields(selected: Address): void {
    const boardSquares = SudokuUtil.getBoardSquares(SudokuUtil.toNumericBoard(this.board, 'value'));
    const selectedSquareAddr = boardSquares.filter(f => {
      return f.some(x => x[0] === selected.row && x[1] === selected.col);
    })[0];

    this.board = this.board.map((row) => {
      return row.map((field) => {
        const crossed = selected.row === field.address.row || selected.col === field.address.col;
        const square = selectedSquareAddr.some(addr => addr[0] === field.address.row && addr[1] === field.address.col);
        field.highlight = crossed || square ? true : false;
        return field;
      });
    });
  }

  private createSudokuGrids(erasePercentage: number): { initial: number[][]; final: number[][] } {
    const grid: number[][] = new SudokuBuilder(this.level.cols).randomizeDiagonal().solveSudoku().getGrid();
    return {
      initial: SudokuUtil.eraseSome(grid, erasePercentage),
      final: grid,
    };
  }

  private createBoardSet(): BoardSet {
    const sudokuGrids = this.createSudokuGrids(0.6);
    // console.log(sudokuGrids);
    let fieldGrid: Board = new GridBuilder<Field>(this.level.rows, this.level.cols, {
      value: 0,
      notes: new NotesBuilder().get(),
      address: { row: 0, col: 0 },
      selected: false,
      highlight: false,
    }).getGrid();

    for (let row = 0; row <= this.squareRoot - 1; row++) {
      for (let col = 0; col <= this.squareRoot - 1; col++) {
        fieldGrid[row][col].value = sudokuGrids.initial[row][col];
        fieldGrid[row][col].address = { row: row, col: col };
      }
    }

    return {
      initial: fieldGrid,
      final: sudokuGrids.final,
    };
  }

  loadLevelProperties(): void {
    this.level = this.gameStateServ.selectedLevel;
    this.squareRoot = this.level.cols;
    this.setBoardSize(this.squareRoot);
  }

  setBoardSize(size: number): void {
    document.documentElement.style.setProperty('--board-size', size.toString());
  }
}
