import { Injectable } from '@angular/core';
import { SudokuBuilder } from 'src/app/shared/builders/sudoku.builder';
import { SudokuUtil } from 'src/app/shared/utils/sudoku.util';
import { Board, BoardSet, SudokuGridSet } from './board.types';
import { GameLevel } from 'src/app/shared/services/game-state.service';
import { GridBuilder } from 'src/app/shared/builders/grid.builder';
import { NotesBuilder } from 'src/app/shared/builders/notes.builder';
import { Address, Field } from './field/field.types';

@Injectable({
  providedIn: 'root',
})
export class BoardService {
  constructor() {}

  private createSudokuGridSet(erasePercentage: number, size: number): SudokuGridSet {
    const grid: number[][] = new SudokuBuilder(size).randomizeDiagonal().solveSudoku().getGrid();
    return {
      initial: SudokuUtil.eraseSome(grid, erasePercentage),
      final: grid,
    };
  }

  createBoardSet(erasePercentage: number, level: GameLevel): BoardSet {
    const sudokuGrids = this.createSudokuGridSet(erasePercentage, level.rows);
    let fieldGrid: Board = new GridBuilder<Field>(level.rows, level.cols, {
      value: 0,
      notes: new NotesBuilder().get(),
      address: { row: 0, col: 0 },
      selected: false,
      highlight: false,
    }).getGrid();

    for (let row = 0; row <= level.rows - 1; row++) {
      for (let col = 0; col <= level.cols - 1; col++) {
        fieldGrid[row][col].value = sudokuGrids.initial[row][col];
        fieldGrid[row][col].address = { row: row, col: col };
      }
    }

    return {
      initial: fieldGrid,
      final: sudokuGrids.final,
    };
  }

  isAddressEqual(sourceAddress: Address, destAddress: Address): boolean {
    return sourceAddress.row === destAddress.row && sourceAddress.col === destAddress.col;
  }
}
