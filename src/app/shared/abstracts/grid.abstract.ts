export abstract class Grid<TGrid> {
  protected rows!: number;
  protected cols!: number;
  protected grid: TGrid[][] = [];
}
