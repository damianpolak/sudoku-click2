import { Injectable } from '@angular/core';
import { Observable, Subject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ControlsService {
  private numberClick = new Subject<number>();

  onNumberClick(value: number) {
    console.log(`Number click ${value}`);
    this.numberClick.next(value);
  }

  getNumberClick$(): Observable<number> {
    return this.numberClick.asObservable();
  }

  constructor() {}
}
