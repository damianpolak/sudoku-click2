import { Board } from "src/app/game/board/board.types";
import { Levels } from "./game-state.service";
import { HistoryBoard } from "./history.types";
import { Timestring } from "./timer.types";

export type InputMode = 'value' | 'notes';

export type GameState = {
  level: Levels;
  timestring: Timestring;
  history: HistoryBoard[];
  board: Board;
}
