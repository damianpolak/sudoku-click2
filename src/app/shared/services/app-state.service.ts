import { Injectable } from '@angular/core';
import { Observable, ReplaySubject, map } from 'rxjs';
import { BasicOrientationType } from './app-state.types';
import { ConversionUtil } from '../utils/conversion.util';

@Injectable({
  providedIn: 'root',
})
export class AppStateService {
  private readonly screenOrientation$ = new ReplaySubject<OrientationType>(5);

  setScreenOrientation(orientation: OrientationType): void {
    this.screenOrientation$.next(orientation);
  }

  getScreenOrientation$(): Observable<BasicOrientationType> {
    return this.screenOrientation$.pipe(
      map((i) => {
        return ConversionUtil.basicOrientationType(i);
      })
    );
  }

  constructor() {}
}
