export type Address = {
  row: number;
  col: number;
};

export type Board = {
  value: number | undefined;
  address: Address;
};

