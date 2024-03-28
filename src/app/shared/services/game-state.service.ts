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
import { StorageService } from './storage.service';

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
  scoreMultiplier: number;
  maxScore?(): number;
}

const levelList: Level[] = [
  { rows: 9, cols: 9, name: Levels.EASY, givenNumbers: 75, scoreMultiplier: 50 },
  { rows: 9, cols: 9, name: Levels.MEDIUM, givenNumbers: 44, scoreMultiplier: 75 },
  { rows: 9, cols: 9, name: Levels.HARD, givenNumbers: 38, scoreMultiplier: 100 },
  { rows: 9, cols: 9, name: Levels.EXPERT, givenNumbers: 28, scoreMultiplier: 150 },
  { rows: 9, cols: 9, name: Levels.MASTER, givenNumbers: 17, scoreMultiplier: 200 },
];

export class GameLevel implements Level {
  rows: number;
  cols: number;
  name: Levels;
  givenNumbers: number;
  scoreMultiplier: number;

  maxScore(): number {
    return (this.rows * this.cols - this.givenNumbers) * this.scoreMultiplier;
  }

  constructor(selectedLevel?: Levels) {
    const level = levelList.find((item) => item.name === selectedLevel);
    if (typeof level == 'undefined') {
      this.rows = levelList[0].rows;
      this.cols = levelList[0].cols;
      this.name = levelList[0].name;
      this.givenNumbers = levelList[0].givenNumbers;
      this.scoreMultiplier = levelList[0].scoreMultiplier;
      return this;
    } else {
      this.rows = level.rows;
      this.cols = level.cols;
      this.name = level.name;
      this.givenNumbers = level.givenNumbers;
      this.scoreMultiplier = level.scoreMultiplier;
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
  private static readonly GAME_STATE_KEY = 'SUDOKU_GAME_STATE' as const;

  private gameStartMode$!: BehaviorSubject<GameStartMode>;

  private readonly pauseState$ = new Subject<boolean>();
  private readonly inputMode$ = new BehaviorSubject<InputModeType>(InputModeType.VALUE);
  private readonly burstMode$ = new BehaviorSubject<BurstModeType>(BurstModeType.NORMAL);
  private readonly missingNumbers$ = new Subject<MissingNumber[]>();
  private readonly selectedBurstNumber$ = new BehaviorSubject<number | undefined>(5);
  private readonly gameState$ = new Subject<GameState>();
  private readonly fieldClick$ = new Subject<Field>();
  private readonly gameStatus$ = new Subject<GameStatusType>();

  private _selectedLevel!: GameLevel;

  constructor(private storageServ: StorageService) {
    console.log('GameStateService constructor');
    (async () => {
      const result = await this.loadGameState();
      console.log('=== gameState', result);
      this.gameStartMode$ = new BehaviorSubject<GameStartMode>(
        result ? { type: GameStartType.CONTINUE, gameState: result } : { type: GameStartType.NEW_GAME }
      );
    })();
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

  getSelectedBurstNumber$(): Observable<number | undefined> {
    return this.selectedBurstNumber$.asObservable();
  }

  setSelectedBurstNumber(value: number | undefined): void {
    this.selectedBurstNumber$.next(value);
  }

  setGameStatus(value: GameStatusType): void {
    this.gameStatus$.next(value);
  }

  getGameStatus$(): Observable<GameStatusType> {
    return this.gameStatus$.asObservable();
  }

  async saveGameState(gamestate: GameState): Promise<void> {
    try {
      await this.storageServ.set(GameStateService.GAME_STATE_KEY, JSON.stringify(gamestate));
    } catch (e) {
      console.log('Cannot save the game state');
    }
  }

  async loadGameState(): Promise<GameState | undefined> {
    try {
      const data = await this.storageServ.get(GameStateService.GAME_STATE_KEY);
      return data !== null ? JSON.parse(data) : undefined;
    } catch (e) {
      console.log('An error occured when trying to load game state');
      return undefined;
    }
  }

  async clearGameState(): Promise<void> {
    await this.storageServ.remove(GameStateService.GAME_STATE_KEY);
  }
}
