import { Injectable } from '@angular/core';
import { Board } from 'src/app/game/board/board.types';
import { Field } from 'src/app/game/board/field/field.types';
import { NotesBuilder } from '../builders/notes.builder';
import { HistoryBoard } from './history.types';

@Injectable({
  providedIn: 'root',
})
export class HistoryService {
  historyBoards: HistoryBoard[] = [];
  constructor() {}

  add(board: Board, selectedField: Field): void {
    this.historyBoards.push({
      board: structuredClone(board),
      selectedField: selectedField,
    });
  }

  private getBeforeLast(): HistoryBoard | undefined {
    if (this.historyBoards.length > 1) {
      return {
        board: this.historyBoards.slice(-2, -1)[0].board,
        selectedField: this.historyBoards.slice(-1)[0].selectedField,
      };
    } else if (this.historyBoards.length === 1) {
      return {
        board: this.historyBoards[0].board.map((row) => {
          return row.map((field) => {
            if (!field.isInitialValue) {
              field.isCorrectValue = false;
              field.value = 0;
              field.notes = new NotesBuilder().get();
            }
            return field;
          });
        }),
        selectedField: this.historyBoards[0].selectedField,
      };
    }
    return undefined;
  }

  back(): HistoryBoard | undefined {
    const last = this.getBeforeLast();
    if (this.historyBoards.length > 1) {
      this.historyBoards = this.historyBoards.splice(0, this.historyBoards.length - 1);
    } else if (this.historyBoards.length === 1) {
      this.historyBoards = [];
    }
    return last;
  }
}
