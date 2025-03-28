import { Board } from 'src/app/game/board/board.types';
import { GameLevel } from './game-state.service';
import { HistoryBoard } from './history.types';
import { Timestring } from './timer.types';
import { Field } from 'src/app/game/board/field/field.types';
import { Mistake } from './mistake.service';

export enum GameStatusType {
  PENDING = 'PENDING',
  VICTORY = 'VICTORY',
  LOSS = 'LOSS',
}

export enum InputModeType {
  VALUE = 'VALUE',
  NOTES = 'NOTES',
}

export enum BurstModeType {
  NORMAL = 'NORMAL',
  BURST = 'BURST',
}

export type GameState = {
  level: GameLevel;
  timestring: Timestring;
  history: HistoryBoard[];
  board: Board;
  mistakes: Mistake[];
  selectedField: Field;
  state: GameStatusType;
  score: number;
};

export type CommonGameState = {
  gameState?: GameState;
  canContinue: boolean;
};

export enum GameStartType {
  CONTINUE = 'CONTINUE',
  NEW_GAME = 'NEW_GAME',
  RESTART_GAME = 'RESTART_GAME',
  SECOND_CHANCE = 'SECOND_CHANCE',
}

export type GameStartMode = {
  type: GameStartType;
  options?: { banner: boolean };
  gameState?: GameState;
};
