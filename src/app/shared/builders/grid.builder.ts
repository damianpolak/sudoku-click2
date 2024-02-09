export abstract class Grid<TGrid> {
  protected rows!: number;
  protected cols!: number;
  protected grid: TGrid[][] = [];
}

export class GridBuilder<TGrid> extends Grid<TGrid> {
  constructor(rows: number, cols: number, value: TGrid) {
    super();
    for (let row = 0; row < rows; row++) {
      this.grid.push([]);
      for (let col = 0; col < cols; col++) {
        this.grid[row][col] = value;
      }
    }
    return this;
  }

  getGrid(): TGrid[][] {
    return this.grid;
  }
}
