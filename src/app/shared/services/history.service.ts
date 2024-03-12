import { Injectable, OnDestroy } from '@angular/core';
import { Board } from 'src/app/game/board/board.types';
import { Field } from 'src/app/game/board/field/field.types';
import { NotesBuilder } from '../builders/notes.builder';
import { HistoryBoard } from './history.types';
import { BehaviorSubject, Observable, ReplaySubject, Subject, Subscription, of } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class HistoryService {
  private _historyBoard: HistoryBoard[] = [];
  private readonly historyBoard$: BehaviorSubject<HistoryBoard[]> = new BehaviorSubject<HistoryBoard[]>([]);
  private historyBoardSub$!: Subscription;
  private get historyBoard() {
    return this._historyBoard;
  }

  constructor() {}

  add(history: HistoryBoard[]): void {
    this.historyBoard$.next([...this._historyBoard, ...history]);
  }

  clear(): void {
    this.historyBoard$.next([]);
  }

  get$(): Observable<HistoryBoard[]> {
    return this.historyBoard$.asObservable();
  }

  create(): void {
    if (!this.historyBoardSub$ || this.historyBoardSub$.closed) {
      this.historyBoardSub$ = this.historyBoard$.subscribe((v) => {
        this._historyBoard = v;
      });
    }
  }

  destroy(): void {
    this._historyBoard = [];
    this.historyBoardSub$.unsubscribe();
  }

  private getBeforeLast(): HistoryBoard | undefined {
    if (this.historyBoard.length > 1) {
      return {
        board: this.historyBoard.slice(-2, -1)[0].board,
        selectedField: this.historyBoard.slice(-1)[0].selectedField,
      };
    } else if (this.historyBoard.length === 1) {
      return {
        board: this.historyBoard[0].board.map((row) => {
          return row.map((field) => {
            if (!field.isInitialValue) {
              field.isCorrectValue = false;
              field.value = 0;
              field.notes = new NotesBuilder().get();
            }
            return field;
          });
        }),
        selectedField: this.historyBoard[0].selectedField,
      };
    }
    return undefined;
  }

  back(): Observable<HistoryBoard | undefined> {
    const last = this.getBeforeLast();
    if (this.historyBoard.length > 1) {
      this.historyBoard$.next(this.historyBoard.splice(0, this.historyBoard.length - 1));
    } else if (this.historyBoard.length === 1) {
      this.historyBoard$.next([]);
    }
    return of(last);
  }
}
