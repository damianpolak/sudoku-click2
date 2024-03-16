import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, Subscription, of } from 'rxjs';
import { Address } from 'src/app/game/board/field/field.types';
import { ServiceStore } from '../abstracts/service-store.abstract';

export type Mistake = {
  address: Address;
  value: number;
  finalValue: number;
};

export type PresentMistake = {
  value: number;
  limit: number;
};

@Injectable({
  providedIn: 'root',
})
export class MistakeService extends ServiceStore<Mistake> {
  private static readonly MISTAKE_LIMIT = 3;
  private static readonly MISTAKE_CHANCES = 1;
  private _limitEnabled: boolean = true;

  get limitEnabled(): boolean {
    return this._limitEnabled;
  }

  getPresentMistakes(): Observable<PresentMistake> {
    return of({
      value: this._store.length,
      limit: this.limitEnabled ? MistakeService.MISTAKE_LIMIT : 0,
    });
  }

  constructor() {
    super();
  }

  secondChance(): void {
    if (this.store.length >= MistakeService.MISTAKE_LIMIT) {
      this.emitter$.next(this.store.splice(0, this.store.length - 1));
    }
  }
}
