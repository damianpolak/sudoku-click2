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
  private readonly newBoardSet$ = new BehaviorSubject<BoardSet>(
    this.createBoardSet(this.gameStateServ.selectedLevel)
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

  createBoardSet(level: GameLevel): BoardSet {
    const boardConstructor = new BoardBuilder({ level: level });
    return {
      initial: boardConstructor.getBoard(),
      final: boardConstructor.getSudokuGridSet().final,
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
