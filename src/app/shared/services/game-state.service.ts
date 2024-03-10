import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, Subject } from 'rxjs';
import { GameState, InputMode } from './game-state.types';
import { MissingNumber } from 'src/app/game/board/board.types';
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
  givenNumbers: number;
}

const levelList: Level[] = [
  { rows: 9, cols: 9, name: Levels.EASY, givenNumbers: 50 },
  { rows: 9, cols: 9, name: Levels.MEDIUM, givenNumbers: 44 },
  { rows: 9, cols: 9, name: Levels.HARD, givenNumbers: 38 },
  { rows: 9, cols: 9, name: Levels.EXPERT, givenNumbers: 28 },
  { rows: 9, cols: 9, name: Levels.MASTER, givenNumbers: 17 },
];

export class GameLevel implements Level {
  rows: number;
  cols: number;
  name: Levels;
  givenNumbers: number;

  constructor(selectedLevel?: Levels) {
    const level = levelList.find((item) => item.name === selectedLevel);
    if (typeof level == 'undefined') {
      this.rows = levelList[0].rows;
      this.cols = levelList[0].cols;
      this.name = levelList[0].name;
      this.givenNumbers = levelList[0].givenNumbers;
      return this;
    } else {
      this.rows = level.rows;
      this.cols = level.cols;
      this.name = level.name;
      this.givenNumbers = level.givenNumbers;
    }
  }
}

@Injectable({
  providedIn: 'root',
})
export class GameStateService {
  private readonly continueAvailable$ = new BehaviorSubject<boolean>(false);
  private readonly pauseState$ = new Subject<boolean>();
  private readonly inputMode$ = new BehaviorSubject<InputMode>('value');
  private readonly missingNumbers$ = new Subject<MissingNumber[]>();
  private readonly gameState$ = new Subject<GameState>();
  private fieldClick$ = new Subject<Field>();

  private _selectedLevel: GameLevel;

  constructor() {
    console.log('GameStateService constructor');
    this._selectedLevel = new GameLevel(Levels.MASTER);
  }

  setGameState(gameState: GameState): void {
    this.gameState$.next(gameState);
  }

  getGameState$(): Observable<GameState> {
    return this.gameState$.asObservable();
  }

  setPauseState(pause: boolean): void {
    this.continueAvailable$.next(pause);
    this.pauseState$.next(pause);
  }

  getPauseState$(): Observable<boolean> {
    return this.pauseState$.asObservable();
  }

  setLevel(value?: Levels): void {
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

  onBoardFieldClick(field: Field): void {
    this.fieldClick$.next(field);
  }

  getBoardFieldClick$(): Observable<Field> {
    return this.fieldClick$.asObservable();
  }

  getMissingNumbers$(): Observable<MissingNumber[]> {
    return this.missingNumbers$.asObservable();
  }

  setMissingNumbers(value: MissingNumber[]): void {
    this.missingNumbers$.next(value);
  }
}
