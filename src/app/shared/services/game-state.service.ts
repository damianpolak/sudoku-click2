import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class GameStateService {
  private readonly continueAvailable = new BehaviorSubject<boolean>(false);
  private readonly pauseState = new BehaviorSubject<boolean>(false);

  setPauseState(pause: boolean): void {
    this.continueAvailable.next(pause);
    this.pauseState.next(pause);
  }

  getPauseState$(): Observable<boolean> {
    return this.pauseState.asObservable();
  }

  getContinueState$(): Observable<boolean> {
    return this.continueAvailable.asObservable();
  }

  constructor() {}
}
