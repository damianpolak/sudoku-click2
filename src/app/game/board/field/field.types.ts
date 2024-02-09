import { Notes } from 'src/app/shared/builders/notes.builder';

export type Field = {
  value: number;
  notes: Notes;
  address: Address;
  selected: boolean;
  highlight: boolean;
};

export type Address = {
  row: number;
  col: number;
};
