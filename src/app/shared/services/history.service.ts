import { Injectable } from '@angular/core';
import { NotesBuilder } from '../builders/notes.builder';
import { HistoryBoard } from './history.types';
import { Observable, of } from 'rxjs';
import { ServiceStore } from '../abstracts/service-store.abstract';

@Injectable({
  providedIn: 'root',
})
export class HistoryService extends ServiceStore<HistoryBoard> {
  constructor() {
    super();
  }

  private getBeforeLast(): HistoryBoard | undefined {
    if (this.store.length > 1) {
      return {
        board: this.store.slice(-2, -1)[0].board,
        selectedField: this.store.slice(-1)[0].selectedField,
      };
    } else if (this.store.length === 1) {
      return {
        board: this.store[0].board.map((row) => {
          return row.map((field) => {
            if (!field.isInitialValue) {
              field.isCorrectValue = false;
              field.value = 0;
              field.notes = new NotesBuilder().get();
            }
            return field;
          });
        }),
        selectedField: this.store[0].selectedField,
      };
    }
    return undefined;
  }

  back(): Observable<HistoryBoard | undefined> {
    const last = this.getBeforeLast();
    if (this.store.length > 1) {
      this.emitter$.next(this.store.splice(0, this.store.length - 1));
    } else if (this.store.length === 1) {
      this.emitter$.next([]);
    }
    return of(last);
  }
}
