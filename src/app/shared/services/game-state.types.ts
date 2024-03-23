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

export type InputMode = 'value' | 'notes';

export type GameState = {
  level: GameLevel;
  timestring: Timestring;
  history: HistoryBoard[];
  board: Board;
  mistakes: Mistake[];
  selectedField: Field;
  state: GameStatusType;
};

export enum GameStartType {
  CONTINUE = 'CONTINUE',
  NEW_GAME = 'NEW_GAME',
  RESTART_GAME = 'RESTART_GAME',
}

export type GameStartMode = {
  type: GameStartType;
  gameState?: GameState;
};
