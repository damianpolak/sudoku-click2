import { Notes } from 'src/app/shared/builders/notes.builder';

export interface Score {
  scored: boolean;
  score: number;
}

export type Field = {
  value: number;
  finalValue: number;
  notes: Notes;
  address: Address;
  selected: boolean;
  highlight: boolean;
  isInitialValue: boolean;
  isCorrectValue?: boolean;
  isAnimated: boolean;
  scoreable: boolean;
  score: Score;
};

export type Address = {
  row: number;
  col: number;
};
