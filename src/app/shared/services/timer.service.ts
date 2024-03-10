import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, Subscription, interval, skipWhile } from 'rxjs';
import { Timestring } from './timer.types';


@Injectable({
  providedIn: 'root',
})
export class TimerService {
  private timer = interval(1000);
  private timerSubs$: Subscription | undefined;
  private timestring = new BehaviorSubject<Timestring>('00:00:00');

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

  getTimestring(): Observable<Timestring> {
    return this.timestring.asObservable();
  }

  private setTimestring(): void {
    const timestring = `${this._hours === 0 ? '' : this._hours.toString().padStart(2, '0') + ':'}${this._minutes
      .toString()
      .padStart(2, '0')}:${this.seconds.toString().padStart(2, '0')}` as Timestring;
    this.timestring.next(timestring);
  }

  start(startAtTimestring?: Timestring): void {
    if(typeof startAtTimestring !== 'undefined') {
      this.overrideTimeValues(startAtTimestring);
    }

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

  restart(startAtTimestring?: Timestring): void {
    this.stop();
    if(typeof startAtTimestring !== 'undefined') {
      this.overrideTimeValues(startAtTimestring);
    } else {
      this._hours = 0;
      this._minutes = 0;
      this._seconds = 0;
    }
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

  private overrideTimeValues(timestring: Timestring): void {
    const numstrToNumber = (value: string) => {
      return Number.isNaN(Number(value)) ? 0 : Number(value);
    }

    try {
      const splittedTimestring = timestring.split(':');
      this._hours = numstrToNumber(splittedTimestring[0]);
      this._minutes = numstrToNumber(splittedTimestring[1]);
      this._seconds = numstrToNumber(splittedTimestring[2]);
    } catch(e) {
      throw new RangeError('Something is wrong with saved time values.');
    }
  }
}
