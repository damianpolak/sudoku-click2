import { Field } from "./field/field.types";

export type Board = Field[][];
export type BoardSet = {
  initial: Board;
  final: number[][];
}
