import { Injectable } from '@angular/core';
import { Observable, map } from 'rxjs';
import { Address } from 'src/app/game/board/field/field.types';
import { ServiceStore } from '../abstracts/service-store.abstract';

export type Mistake = {
  address: Address;
  value: number;
  finalValue: number;
  chanceUsed?: boolean;
};

export type PresentMistake = {
  value: number;
  limit: number;
  secondChanceUsed?: boolean;
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

  constructor() {
    super();
  }

  getPresentMistakes(): Observable<PresentMistake> {
    return this.emitter$.pipe(
      map((x) => {
        return {
          value: x.length,
          limit: this.limitEnabled ? MistakeService.MISTAKE_LIMIT : 0,
          secondChanceUsed: x.some((s) => s.chanceUsed),
        };
      })
    );
  }

  canUseSecondChance(): Observable<boolean> {
    return this.getPresentMistakes().pipe(
      map((x) => {
        return x.value >= x.limit && x.secondChanceUsed === true;
      })
    );
  }

  secondChance(): void {
    if (this.store.length >= MistakeService.MISTAKE_LIMIT) {
      const mistakes = this.store.splice(0, this.store.length - 1);
      mistakes[mistakes.length - 1] = { ...mistakes[mistakes.length - 1], ...{ chanceUsed: true } };
      this.emitter$.next(mistakes);
    }
  }
}
