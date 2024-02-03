import { Injectable } from '@angular/core';
import { Observable, ReplaySubject, map } from 'rxjs';
import { BasicOrientationType } from './app-state.types';
import { ConversionHelper } from '../helpers/conversion.helper';

@Injectable({
  providedIn: 'root',
})
export class AppStateService {
  private readonly screenOrientation = new ReplaySubject<OrientationType>(5);

  setScreenOrientation(orientation: OrientationType): void {
    this.screenOrientation.next(orientation);
  }

  getScreenOrientation$(): Observable<BasicOrientationType> {
    return this.screenOrientation.pipe(
      map((i) => {
        return ConversionHelper.basicOrientationType(i);
      })
    );
  }

  constructor() {}
}
