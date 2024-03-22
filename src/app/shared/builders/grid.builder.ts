import { Grid } from '../abstracts/grid.abstract';

export class GridBuilder<TGrid> extends Grid<TGrid> {
  constructor(rows: number, cols: number, value: TGrid) {
    super();
    this.create(rows, cols, value);
    return this;
  }

  private create(rows: number, cols: number, value: TGrid) {
    const grid: TGrid[][] = [];
    for (let row = 0; row < rows; row++) {
      grid.push([]);
      for (let col = 0; col < cols; col++) {
        grid[row][col] = structuredClone(value);
      }
    }

    this.grid = structuredClone(grid);
  }

  getGrid(): TGrid[][] {
    return this.grid;
  }
}
