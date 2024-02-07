import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, Subscription, interval, skipWhile } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class TimerService {
  private timer = interval(1000);
  private timerSubs$: Subscription | undefined;
  private timestring = new BehaviorSubject<string>('00:00:00');

  private _seconds: number = 0;
  private _minutes: number = 0;
  private _hours: number = 0;

  private _finished: boolean = false;

  get seconds(): number {
    return this._seconds;
  }

  get minutes(): number {
    return this._minutes;
  }

  get hours(): number {
    return this._hours;
  }

  constructor() {}

  isPaused(): boolean {
    return typeof this.timerSubs$ === 'undefined';
  }

  getTimestring(): Observable<string> {
    return this.timestring.asObservable();
  }

  private setTimestring(): void {
    const timestring = `${this._hours.toString().padStart(2, '0')}:${this._minutes
      .toString()
      .padStart(2, '0')}:${this.seconds.toString().padStart(2, '0')}`;
    this.timestring.next(timestring);
  }

  start(): void {
    if (!this.timerSubs$) {
      if (this._finished) {
        this.restart();
      }

      this._finished = false;
      this.timerSubs$ = this.timer.subscribe((x) => {
        this.increment();
      });
    }
  }

  stop(): void {
    if (this.timerSubs$) {
      this.timerSubs$.unsubscribe();
      this.timerSubs$ = undefined;
    }
  }

  restart(): void {
    this.stop();
    this._hours = 0;
    this._minutes = 0;
    this._seconds = 0;
    this.setTimestring();
  }

  increment(): void {
    this._seconds++;

    if (this._seconds > 59) {
      this._minutes++;
      this._seconds = 0;
    }

    if (this._minutes > 59) {
      this._hours++;
      this._minutes = 0;
    }

    if (this._hours == 23 && this.minutes == 59 && this.seconds == 59) {
      this.stop();
      this._finished = true;
    }

    this.setTimestring();
  }
}
