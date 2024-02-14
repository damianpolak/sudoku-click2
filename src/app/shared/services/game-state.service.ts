import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, Subject } from 'rxjs';
import { InputMode } from './game-state.types';
import { Board } from 'src/app/game/board/board.types';
import { Field } from 'src/app/game/board/field/field.types';

export enum Levels {
  EASY = 'EASY',
  MEDIUM = 'MEDIUM',
  HARD = 'HARD',
  EXPERT = 'EXPERT',
  MASTER = 'MASTER',
}

interface Level {
  rows: number;
  cols: number;
  name: Levels;
  difficulty: number;
}

const levelList: Level[] = [
  { rows: 9, cols: 9, name: Levels.EASY, difficulty: 0 },
  { rows: 9, cols: 9, name: Levels.MEDIUM, difficulty: 0 },
  { rows: 9, cols: 9, name: Levels.HARD, difficulty: 0 },
  { rows: 9, cols: 9, name: Levels.EXPERT, difficulty: 0 },
  { rows: 9, cols: 9, name: Levels.MASTER, difficulty: 0 },
];

export class GameLevel implements Level {
  rows: number;
  cols: number;
  name: Levels;
  difficulty: number;

  constructor(selectedLevel?: Levels) {
    const level = levelList.find((item) => item.name === selectedLevel);
    if(typeof level == 'undefined') {
      this.rows = levelList[0].rows;
      this.cols = levelList[0].cols;
      this.name = levelList[0].name;
      this.difficulty = levelList[0].difficulty;
      return this;
    } else {
      this.rows = level.rows;
      this.cols = level.cols;
      this.name = level.name;
      this.difficulty = level.difficulty;
    }
  }
}

@Injectable({
  providedIn: 'root',
})
export class GameStateService {
  private readonly continueAvailable$ = new BehaviorSubject<boolean>(false);
  private readonly pauseState$ = new BehaviorSubject<boolean>(false);
  private readonly inputMode$ = new BehaviorSubject<InputMode>('value');

  private _selectedLevel: GameLevel;

  constructor() {
    this._selectedLevel = new GameLevel(Levels.EASY);
  }

  setPauseState(pause: boolean): void {
    this.continueAvailable$.next(pause);
    this.pauseState$.next(pause);
  }

  getPauseState$(): Observable<boolean> {
    return this.pauseState$.asObservable();
  }

  setLevel(value?: Levels): void {
    console.log(`Set Lev`, value);
    this._selectedLevel = new GameLevel(value);
  }

  get selectedLevel() {
    return this._selectedLevel;
  }

  getContinueState$(): Observable<boolean> {
    return this.continueAvailable$.asObservable();
  }

  setInputMode(mode: InputMode): void {
    this.inputMode$.next(mode);
  }

  getInputMode$(): Observable<InputMode> {
    return this.inputMode$.asObservable();
  }

  private fieldClick$ = new Subject<Field>();
  onBoardFieldClick(field: Field): void {
    this.fieldClick$.next(field);
  }

  getBoardFieldClick$(): Observable<Field> {
    return this.fieldClick$.asObservable();
  }

}
