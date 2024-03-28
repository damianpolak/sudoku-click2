import { Injectable } from '@angular/core';
import { ServiceStore } from '../abstracts/service-store.abstract';
import { Observable, map } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ScoreService extends ServiceStore<number> {
  constructor() {
    super();
  }

  getPresentScore(): Observable<number> {
    return this.emitter$.pipe(map((x) => (x[0] ? x[0] : 0)));
  }
}
