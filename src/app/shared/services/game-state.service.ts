import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, Subject, first } from 'rxjs';
import {
  BurstModeType,
  GameStartMode,
  GameStartType,
  GameState,
  GameStatusType,
  InputModeType,
} from './game-state.types';
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
  { rows: 9, cols: 9, name: Levels.EASY, givenNumbers: 75 },
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
  /**
   * Game state local storage key
   */
  private static readonly GAME_STATE_KEY = 'GAME_STATE' as const;

  private readonly gameStartMode$ = new BehaviorSubject<GameStartMode>(
    this.loadGameState()
      ? { type: GameStartType.CONTINUE, gameState: this.loadGameState() }
      : { type: GameStartType.NEW_GAME }
  );
  private readonly pauseState$ = new Subject<boolean>();
  private readonly inputMode$ = new BehaviorSubject<InputModeType>(InputModeType.VALUE);
  private readonly burstMode$ = new BehaviorSubject<BurstModeType>(BurstModeType.NORMAL);
  private readonly missingNumbers$ = new Subject<MissingNumber[]>();
  private readonly gameState$ = new Subject<GameState>();
  private readonly fieldClick$ = new Subject<Field>();
  private readonly gameStatus$ = new Subject<GameStatusType>();

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

  updateGameState(gameState: Partial<GameState>): void {
    this.getGameState$()
      .pipe(first())
      .subscribe((v) =>
        this.gameState$.next({
          ...v,
          ...gameState,
        })
      );
  }

  setPauseState(pause: boolean): void {
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

  getGameStartMode$(): Observable<GameStartMode> {
    return this.gameStartMode$.asObservable();
  }

  setGameStartMode(value: GameStartMode): void {
    this.gameStartMode$.next(value);
  }

  setInputMode(mode: InputModeType): void {
    this.inputMode$.next(mode);
  }

  getInputMode$(): Observable<InputModeType> {
    return this.inputMode$.asObservable();
  }

  setBurstMode(value: BurstModeType): void {
    this.burstMode$.next(value);
  }

  getBurstMode$(): Observable<BurstModeType> {
    return this.burstMode$.asObservable();
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

  setGameStatus(value: GameStatusType): void {
    this.gameStatus$.next(value);
  }

  getGameStatus$(): Observable<GameStatusType> {
    return this.gameStatus$.asObservable();
  }

  saveGameState(gamestate: GameState): void {
    try {
      localStorage.setItem(GameStateService.GAME_STATE_KEY, JSON.stringify(gamestate));
    } catch (e) {
      console.log('Cannot save game state');
    }
  }

  loadGameState(): GameState | undefined {
    try {
      const data = localStorage.getItem(GameStateService.GAME_STATE_KEY);
      return data !== null ? JSON.parse(data) : undefined;
    } catch (e) {
      console.log('An error occured when trying to load game state.');
      return undefined;
    }
  }

  clearGameState(): void {
    localStorage.removeItem(GameStateService.GAME_STATE_KEY);
  }
}
