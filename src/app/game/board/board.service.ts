import { Injectable } from '@angular/core';
import { SudokuUtil } from 'src/app/shared/utils/sudoku.util';
import { Board, BoardSet } from './board.types';
import { GameLevel, GameStateService } from 'src/app/shared/services/game-state.service';
import { Address } from './field/field.types';
import { BehaviorSubject, Observable, Subject, Subscription, map, tap } from 'rxjs';
import { BoardBuilder } from 'src/app/shared/builders/board.builder';

@Injectable({
  providedIn: 'root',
})
export class BoardService {
  private readonly board$ = new BehaviorSubject<Board>(
    new BoardBuilder({ level: this.gameStateServ.selectedLevel }).get()
  );

  constructor(private gameStateServ: GameStateService) {}

  getBoard(): Observable<Board> {
    return this.board$
      .asObservable()
      .pipe(
        tap((_) => {
          this.updateMissingNumbers(_);
        })
      )
      .pipe(map((x) => x));
  }

  setBoard(board: Board): void {
    this.board$.next(board);
  }

  private updateMissingNumbers(board: Board): void {
    this.gameStateServ.setMissingNumbers(
      this.getMissingNumbers(SudokuUtil.toNumericBoard(board, 'value')).map((i, index) => {
        return {
          id: index + 1,
          value: i,
        };
      })
    );
  }

  private getMissingNumbers(board: number[][], max: number = 9): number[] {
    const b = structuredClone(board).flat();
    const missingArr: number[] = [];
    for (let i = 1; i <= max; i++) {
      missingArr.push(max - b.filter((f) => f === i).length);
    }
    return missingArr;
  }
}
