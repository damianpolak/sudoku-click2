import { Notes } from 'src/app/shared/builders/notes.builder';

export type Field = {
  value: number;
  finalValue: number;
  notes: Notes;
  address: Address;
  selected: boolean;
  highlight: boolean;
  isInitialValue: boolean;
  isCorrectValue?: boolean;
};

export type Address = {
  row: number;
  col: number;
};
