import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Input, OnDestroy, OnInit } from '@angular/core';
import { NotesBuilder } from 'src/app/shared/builders/notes.builder';
import { GameLevel, GameStateService } from 'src/app/shared/services/game-state.service';
import { Address, Field } from './field/field.types';
import { SudokuBuilder } from 'src/app/shared/builders/sudoku.builder';
import { GridBuilder } from 'src/app/shared/builders/grid.builder';
import { Board, BoardSet } from './board.types';
import { SudokuUtil } from 'src/app/shared/utils/sudoku.util';
import { BehaviorSubject, Observable, Subscription, tap } from 'rxjs';
import { ControlsService } from '../controls/controls.service';
import { InputMode } from 'src/app/shared/services/game-state.types';
import { BoardService } from './board.service';

@Component({
  selector: 'app-board',
  templateUrl: './board.component.html',
  styleUrls: ['./board.component.scss'],
  providers: [BoardService],
})
export class BoardComponent implements OnInit, OnDestroy {
  squareRoot!: number;
  @Input() mode: boolean = false;

  inputMode: InputMode = 'value';
  level!: GameLevel;
  board: Board = [];

  private selectedField!: Field;
  private inputModeSubs$: Subscription = this.gameStateServ.getInputMode$().subscribe((x) => (this.inputMode = x));
  private numberClickSubs$!: Subscription;
  private testBoardSubs$!: Subscription;
  private testFieldSubs$!: Subscription;

  constructor(
    private gameStateServ: GameStateService,
    private controlsServ: ControlsService,
    private boardServ: BoardService
  ) {}

  ngOnInit() {
    this.loadLevelProperties();
    this.board = this.boardServ.createBoardSet(0.6, this.level).initial;

    this.numberClickSubs$ = this.controlsServ.getNumberClick$().subscribe((click) => {
      const updateBoard = (board: Board) => {
        this.board = this.selectedField.value === 0 ? board : this.board;
      };
      switch (this.inputMode) {
        case 'value':
          updateBoard(this.updateNumberValue(this.board, click.number, this.selectedField.address));
          break;
        case 'notes':
          updateBoard(this.updateNotesValue(this.board, click.number, this.selectedField.address));
          break;
      }
    });

    this.testFieldSubs$ = this.gameStateServ
      .getFieldBoard$()
      .pipe(
        tap((_) => {
          this.board = this.unselectAllFields(this.board);
        })
      )
      .subscribe((field) => {
        this.board = this.highlightFields(this.board, field.address);
        this.board[field.address.row][field.address.col].selected = field.selected;
        this.selectedField = field;
      });
  }

  ngOnDestroy(): void {
    this.inputModeSubs$.unsubscribe();
    this.numberClickSubs$.unsubscribe();
    this.testBoardSubs$.unsubscribe();
    this.testFieldSubs$.unsubscribe();
  }

  trackFieldByAddress(index: number, item: Field): string {
    return `${item.address.row}${item.address.col}`;
  }

  private getAllFieldsWithNumber(board: Board, value: number): Field[] {
    return structuredClone(board).flat().filter(x => x.value === value);
  }

  private updateNumberValue(board: Board, value: number, selectedField: Address): Board {
    return structuredClone(board).map((row) =>
      row.map((field) => {
        field.value = this.boardServ.isAddressEqual(field.address, selectedField) ? value : field.value;
        return field;
      })
    );
  }

  private updateNotesValue(board: Board, value: number, selectedAddress: Address): Board {
    return structuredClone(board).map((row) =>
      row.map((field) => {
        if (this.boardServ.isAddressEqual(field.address, selectedAddress)) {
          const currentNotesValues: number[] = field.notes.filter((f) => f.active).map((i) => i.value);
          if (currentNotesValues.includes(value)) {
            field.notes = new NotesBuilder([
              ...field.notes
                .filter((f) => f.active)
                .map((i) => i.value)
                .filter((f) => f !== value),
            ]).get();
          } else {
            field.notes = new NotesBuilder([
              ...field.notes.filter((f) => f.active).map((i) => i.value),
              ...[value],
            ]).get();
          }
        }
        return field;
      })
    );
  }

  private unselectAllFields(board: Board): Board {
    return structuredClone(board).map((row) => {
      return row.map((field) => {
        field.selected = false;
        field.highlight = false;
        return field;
      });
    });
  }

  private highlightFields(board: Board, selected: Address): Board {
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

  loadLevelProperties(): void {
    this.level = this.gameStateServ.selectedLevel;
    this.squareRoot = this.level.cols;
    this.setBoardSize(this.squareRoot);
  }

  private setBoardSize(size: number): void {
    document.documentElement.style.setProperty('--board-size', size.toString());
  }
}
