import { Injectable } from '@angular/core';
import { SudokuBuilder } from 'src/app/shared/builders/sudoku.builder';
import { SudokuUtil } from 'src/app/shared/utils/sudoku.util';
import { Board, BoardSet, MissingNumber, SudokuGridSet } from './board.types';
import { GameLevel, GameStateService } from 'src/app/shared/services/game-state.service';
import { GridBuilder } from 'src/app/shared/builders/grid.builder';
import { NotesBuilder } from 'src/app/shared/builders/notes.builder';
import { Address, Field } from './field/field.types';
import { BehaviorSubject, Observable, Subject, Subscription, map, tap } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class BoardService {
  private readonly newBoardSet$ = new BehaviorSubject<BoardSet>(
    this.createBoardSet(this.gameStateServ.selectedLevel.givenNumbers, this.gameStateServ.selectedLevel)
  );

  getBoard(): Observable<Board> {
    return this.newBoardSet$
      .asObservable()
      .pipe(
        tap((_) => {
          this.gameStateServ.setMissingNumbers(
            this.getMissingNumbers(SudokuUtil.toNumericBoard(_.initial, 'value')).map((i, index) => {
              return {
                id: index + 1,
                value: i,
              };
            })
          );
        })
      )
      .pipe(map((x) => x.initial));
  }

  getBoardFinal$(): Observable<number[][]> {
    return this.newBoardSet$.asObservable().pipe(map((x) => x.final));
  }

  setBoard(board: Board): void {
    this.newBoardSet$.next({
      final: this.newBoardSet$.value.final,
      initial: board,
    });
  }

  constructor(private gameStateServ: GameStateService) {}

  private createSudokuGridSet(givenNumbers: number, size: number): SudokuGridSet {
    const grid: number[][] = new SudokuBuilder(size).randomizeDiagonal().solveSudoku().getGrid();
    return {
      initial: SudokuUtil.eraseSome(grid, givenNumbers),
      final: grid,
    };
  }

  createBoardSet(givenNumbers: number, level: GameLevel): BoardSet {
    const sudokuGrids = this.createSudokuGridSet(givenNumbers, level.rows);
    let fieldGrid: Board = new GridBuilder<Field>(level.rows, level.cols, {
      value: 0,
      notes: new NotesBuilder().get(),
      address: { row: 0, col: 0 },
      selected: false,
      highlight: false,
      initialValue: false,
    }).getGrid();

    for (let row = 0; row <= level.rows - 1; row++) {
      for (let col = 0; col <= level.cols - 1; col++) {
        const sudokuValue = sudokuGrids.initial[row][col];
        fieldGrid[row][col].value = sudokuValue;
        fieldGrid[row][col].initialValue = sudokuValue === 0 ? false : true;
        fieldGrid[row][col].address = { row: row, col: col };
      }
    }

    console.log(
      'Empty: ',
      SudokuUtil.toNumericBoard(fieldGrid, 'value')
        .flat()
        .filter((i) => i == 0).length
    );
    console.log(
      'Given number: ',
      SudokuUtil.toNumericBoard(fieldGrid, 'value')
        .flat()
        .filter((i) => i != 0).length
    );

    return {
      initial: fieldGrid,
      final: sudokuGrids.final,
    };
  }

  getMissingNumbers(board: number[][], max: number = 9): number[] {
    const b = structuredClone(board).flat();
    const missingArr: number[] = [];
    for (let i = 1; i <= max; i++) {
      missingArr.push(max - b.filter((f) => f === i).length);
    }
    return missingArr;
  }

  isAddressEqual(sourceAddress: Address, destAddress: Address): boolean {
    return sourceAddress.row === destAddress.row && sourceAddress.col === destAddress.col;
  }
}
