import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class GameStateService {
  private readonly pauseState = new BehaviorSubject<boolean>(false);

  setPauseState(pause: boolean): void {
    this.pauseState.next(pause);
  }

  getPauseState$(): Observable<boolean> {
    return this.pauseState.asObservable();
  }
  constructor() {}
}
