import { Injectable } from '@angular/core';
import { SudokuBuilder } from 'src/app/shared/builders/sudoku.builder';
import { SudokuUtil } from 'src/app/shared/utils/sudoku.util';
import { Board, BoardSet, MissingNumber, NewBoard, SudokuGridSet } from './board.types';
import { GameLevel, GameStateService } from 'src/app/shared/services/game-state.service';
import { GridBuilder } from 'src/app/shared/builders/grid.builder';
import { NotesBuilder } from 'src/app/shared/builders/notes.builder';
import { Address, Field } from './field/field.types';
import { BehaviorSubject, Observable, Subject, Subscription, combineLatest, first, map, merge, of, tap, withLatestFrom, zip } from 'rxjs';
import { ControlsService } from '../controls/controls.service';

@Injectable({
  providedIn: 'root',
})
export class BoardService {
  private readonly newBoardSet$ = new BehaviorSubject<BoardSet>(
    this.createBoardSet(this.gameStateServ.selectedLevel.givenNumbers, this.gameStateServ.selectedLevel)
  );

  readonly onFieldClick$ = this.gameStateServ
    .getBoardFieldClick$()
    .pipe(withLatestFrom(this.getBoard$()))
    .pipe(
      map(([field, board]) => {
        if (field.value !== 0) {
          return {
            field: field,
            board: new NewBoard(board)
              .unselectAllFields()
              .highlightFields(field.address)
              .updateFieldInBoard(field)
              .selectFieldsByNumber(field.value)
              .getBoard(),
          };
        } else {
          return {
            field: field,
            board: new NewBoard(board)
            .unselectAllFields()
            .updateFieldInBoard(field)
            .getBoard(),
          };
        }
      })
    )
    // .pipe(
    //   tap((_) => {
    //     this.gameStateServ.setMissingNumbers(
    //       this.getMissingNumbers(SudokuUtil.toNumericBoard(_.board, 'value')).map((i, index) => {
    //         return {
    //           id: index + 1,
    //           value: i,
    //         };
    //       })
    //     );
    //   })
    // );

  readonly onNumberClick$ = this.controlsServ
    .getNumberClick$()
    .pipe(withLatestFrom(this.onFieldClick$, this.gameStateServ.getInputMode$()))
    .pipe(
      map(([number, field, mode]) => {
        return {
          selectedField: field.field,
          selectedNumber: number,
          board: field.board,
          mode: mode,
        };
      })
    )
    .pipe(
      map((x) => {
        const notInitialValue = !x.selectedField.initialValue;
        const notCorrectValue = !x.board[x.selectedField.address.row][x.selectedField.address.col].isCorrectValue;
        const notNotesMode = x.mode !== 'notes';

        if (notInitialValue && notCorrectValue && notNotesMode) {
          return {
            board: new NewBoard(x.board)
              .unselectAllFields()
              .updateFieldInBoard({ value: x.selectedNumber.number, address: x.selectedField.address })
              .highlightFields(x.selectedField.address)
              .selectFieldsByNumber(x.selectedNumber.number)
              .getBoard(),
          };
        } else {
          return {
            board: new NewBoard(x.board)
              .unselectAllFields()
              .updateFieldInBoard({ notes: new NotesBuilder([1,2,3]).get(), address: x.selectedField.address })
              .getBoard(),
          }
        }
      })
    )
    .pipe(tap(_ => {
      this.setBoard$(_.board);
    }));

  getBoard$(): Observable<Board> {
    return this.newBoardSet$
      .asObservable()
      // .pipe(
      //   tap((_) => {
      //     this.gameStateServ.setMissingNumbers(
      //       this.getMissingNumbers(SudokuUtil.toNumericBoard(_.initial, 'value')).map((i, index) => {
      //         return {
      //           id: index + 1,
      //           value: i,
      //         };
      //       })
      //     );
      //   })
      // )
      .pipe(map((x) => x.initial));
  }

  getBoardFinal$(): Observable<number[][]> {
    return this.newBoardSet$.asObservable().pipe(map((x) => x.final));
  }

  setBoard$(board: Board): void {
    this.newBoardSet$.next({
      final: this.newBoardSet$.value.final,
      initial: board,
    });
  }

  private boardSubFirst$: Subscription = this.getBoard$().pipe(first()).subscribe(v => {
    console.log('first time sub', v);
    
    // this.gameStateServ.onBoardFieldClick()
  })

// Pierwszy observable
private firstObservable = of('Wartość z pierwszego observable');

// Drugi observable
private secondObservable = of('Wartość z drugiego observable').pipe(
  // W tym przypadku nie potrzebujemy już operatora first, ponieważ chcemy, aby drugi observable emitował wartości za każdym razem.
);

// Zestawienie wyników obu observables
// private asd = combineLatest(
// [  this.getBoard$().pipe(first()),
//   this.getBoard$()]
//   // this.firstObservable.pipe(first()), // Emituj tylko pierwszą wartość z pierwszego observable
//   // this.secondObservable
// ).subscribe(([firstResult, secondResult]) => {
//   console.log('Pierwszy wynik:', firstResult);
//   console.log('Drugi wynik:', secondResult);
// });

  constructor(private gameStateServ: GameStateService, private controlsServ: ControlsService) {}

  private createSudokuGridSet(givenNumbers: number, size: number): SudokuGridSet {
    const grid: number[][] = new SudokuBuilder(size).randomizeDiagonal().solveSudoku().getGrid();
    return {
      initial: SudokuUtil.eraseSome(grid, givenNumbers),
      final: grid,
    };
  }

  createBoardSet(givenNumbers: number, level: GameLevel): BoardSet {
    const sudokuGrids = this.createSudokuGridSet(givenNumbers, level.rows);
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
        fieldGrid[row][col].isCorrectValue = sudokuValue > 0;
      }
    }
    
    return {
      initial: fieldGrid,
      // initial: new NewBoard(fieldGrid).setDefaultSelectedField().getBoard(),
      final: sudokuGrids.final,
    };
  }

  getMissingNumbers(board: number[][], max: number = 9): number[] {
    const missingArr: number[] = [];
    for (let i = 1; i <= max; i++) {
      missingArr.push(max - structuredClone(board).flat().filter((f) => f === i).length);
    }
    return missingArr;
  }

  isAddressEqual(sourceAddress: Address, destAddress: Address): boolean {
    return sourceAddress.row === destAddress.row && sourceAddress.col === destAddress.col;
  }
}
