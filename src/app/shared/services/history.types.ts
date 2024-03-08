import { Board } from "src/app/game/board/board.types";
import { Field } from "src/app/game/board/field/field.types";

export type HistoryBoard = {
  board: Board;
  selectedField: Field;
};
