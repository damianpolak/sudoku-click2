import { Injectable, OnDestroy } from '@angular/core';
import { SudokuBuilder } from 'src/app/shared/builders/sudoku.builder';
import { SudokuUtil } from 'src/app/shared/utils/sudoku.util';
import { Board, BoardSet, SudokuGridSet } from './board.types';
import { GameLevel, GameStateService, Levels } from 'src/app/shared/services/game-state.service';
import { GridBuilder } from 'src/app/shared/builders/grid.builder';
import { NotesBuilder } from 'src/app/shared/builders/notes.builder';
import { Address, Field } from './field/field.types';
import { BehaviorSubject, Subject, Subscription, combineLatest, first, forkJoin, map, tap } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class BoardService implements OnDestroy {

  // private board$ = new BehaviorSubject<BoardSet>(this.createBoardSet(0.6, this.level));
  private selectedField$: Subject<Field> = new Subject();
  private boardInitial$ = new Subject<Board>();
  private boardFinal$ = new Subject<number[][]>();

  private selectedFieldSubs$: Subscription = this.selectedField$.subscribe(x => {
    this.selectedField = x;
  });

  private boardSubs$: Subscription;

  private boardInitial!: Board;
  private boardFinal: number[][] = [];
  private selectedField: Field | undefined;


  get board(): Board {
    return this.boardInitial;
  }

  get level(): GameLevel {
    return this.gameStateServ.selectedLevel;
  }

  updateBoard(board: Board): void {
    // this.board$.next()
  }

  constructor(private gameStateServ: GameStateService) {
    this.boardSubs$ = combineLatest({
      selected: this.selectedField$.asObservable(),
      board: this.boardInitial$.asObservable(),
    }).pipe(tap(_ => {
      this.selectedField = _.selected;
    })).pipe(map(x => {
      return {
        selected: x.selected,
        board: this.highlightFields(x.board, this.selectedField?.address as Address)
      }
    })).pipe(map(x => {
      return this.selectMultipleValues(x.board, x.selected)
    })).subscribe(v => {
      this.boardInitial = v;
      this.boardInitial[(this.selectedField as Field).address.row][(this.selectedField as Field).address.col].selected = true;
    });
    
    // DEFAULTS
    const boardSet = this.createBoardSet(this.level);
    this.boardInitial$.next(boardSet.initial);
    this.selectedField$.next(this.getDefaultField(boardSet.initial));
  }

  ngOnDestroy(): void {
    this.boardSubs$.unsubscribe();
  }

  private updateBoardInitial(board: Board): void {
    this.boardInitial$.next(board);
  }

  private selectMultipleValues(board: Board, selectedField: Field): Board {
    if (selectedField.value !== 0) {
      const fields = this.getAllFieldsWithNumber(structuredClone(board), selectedField.value).map((i) => i.address);
      return this.selectFieldsByAddress(structuredClone(board), fields);
    } else {
      return board;
    }
  }

  private highlightFields(board: Board, selected: Address): Board {
    console.log('addr', selected);
    const boardSquares = SudokuUtil.getBoardSquares(SudokuUtil.toNumericBoard(structuredClone(board), 'value'));
    const selectedSquareAddr = boardSquares.filter((f) => {
      return f.some((x) => x[0] === selected.row && x[1] === selected.col);
    })[0];

    return structuredClone(board).map((row) => {
      return row.map((field) => {
        const crossed = selected.row === field.address.row || selected.col === field.address.col;
        const square = selectedSquareAddr.some(
          (addr) => addr[0] === field.address.row && addr[1] === field.address.col
        );
        field.highlight = crossed || square ? true : false;
        return field;
      });
    });
  }

  private getAllFieldsWithNumber(board: Board, value: number): Field[] {
    return structuredClone(board)
      .flat()
      .filter((x) => x.value === value);
  }

  private selectFieldsByAddress(board: Board, address: Address[]): Board {
    return structuredClone(board).map((row) => {
      return row.map((field) => {
        if (address.some((x) => this.isAddressEqual(field.address, x))) {
          field.selected = true;
        }
        return field;
      });
    });
  }


  updateSelectedField(field: Field): void {
    this.selectedField$.next(field);
  }

  public getDefaultField(_board: Board): Field {
    let board = structuredClone(_board);
    const random = this.getRandomEmptyFieldAddress(board, this.level);
    console.log(`Random is`, random);
    return {
      ...board[random.row][random.col],
      ...{ selected: true }
    }
  }

  private getRandomEmptyFieldAddress(board: Board, level: GameLevel): Address {
    const address = {
      row: Math.floor(Math.random() * (level.rows)),
      col: Math.floor(Math.random() * (level.cols)),
    };

    return board[address.row][address.col].value === 0 ? address : this.getRandomEmptyFieldAddress(board, level);
  }

  // private setDefaultSelectedField(board:): void {
  //   const random = this.getRandomEmptyFieldAddress();
  //   this.board = this.highlightFields(this.board, this.board[random.row][random.col].address);
  //   this.board[random.row][random.col].selected = true;
  //   this.selectedField = this.board[random.row][random.col];
  // }
  
  private createSudokuGridSet(erasePercentage: number, size: number): SudokuGridSet {
    const grid: number[][] = new SudokuBuilder(size).randomizeDiagonal().solveSudoku().getGrid();
    return {
      initial: SudokuUtil.eraseSome(grid, erasePercentage),
      final: grid,
    };
  }

  createBoardSet(level: GameLevel): BoardSet {
    const sudokuGrids = this.createSudokuGridSet(level.difficulty, level.rows);
    let fieldGrid: Board = new GridBuilder<Field>(level.rows, level.cols, {
      value: 0,
      notes: new NotesBuilder().get(),
      address: { row: 0, col: 0 },
      selected: false,
      highlight: false,
      initialValue: false,
    }).getGrid();

    for (let row = 0; row <= level.rows - 1; row++) {
      for (let col = 0; col <= level.cols - 1; col++) {
        const sudokuValue = sudokuGrids.initial[row][col];
        fieldGrid[row][col].value = sudokuValue;
        fieldGrid[row][col].initialValue = sudokuValue === 0 ? false : true;
        fieldGrid[row][col].address = { row: row, col: col };
      }
    }

    return {
      initial: fieldGrid,
      final: sudokuGrids.final,
    };
  }

  isAddressEqual(sourceAddress: Address, destAddress: Address): boolean {
    return sourceAddress.row === destAddress.row && sourceAddress.col === destAddress.col;
  }
}
