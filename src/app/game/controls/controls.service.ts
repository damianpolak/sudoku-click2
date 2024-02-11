import { Injectable } from '@angular/core';
import { Observable, Subject } from 'rxjs';
import { InputMode } from 'src/app/shared/services/game-state.types';

type NumberClickEvent = {
  mode: InputMode,
  number: number;
}

@Injectable({
  providedIn: 'root',
})
export class ControlsService {
  private numberClick$ = new Subject<NumberClickEvent>();

  onNumberClick(value: NumberClickEvent): void {
    console.log(`Number click event: `, value);
    this.numberClick$.next(value);
  }

  getNumberClick$(): Observable<NumberClickEvent> {
    return this.numberClick$.asObservable();
  }

  constructor() {}
}
