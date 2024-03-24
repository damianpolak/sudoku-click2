import { Injectable } from '@angular/core';
import { Observable, Subject } from 'rxjs';
import { InputModeType } from 'src/app/shared/services/game-state.types';

export enum NumberClickEventSource {
  FIELD = 'FIELD',
  NUMBER = 'NUMBER',
}

export type NumberClickEvent = {
  source: NumberClickEventSource;
  mode: InputModeType;
  number: number;
};

export type FeatureClickEvent = {
  type: FeatureClickType;
  feature: Features;
  toggle?: boolean;
};

type FeatureClickType = 'click' | 'toggle';

export type Features = 'back' | 'erase' | 'notes' | 'tip' | 'burst';

@Injectable({
  providedIn: 'root',
})
export class ControlsService {
  private readonly numberClick$ = new Subject<NumberClickEvent>();
  private readonly featureClick$ = new Subject<FeatureClickEvent>();

  onNumberClick(value: NumberClickEvent): void {
    this.numberClick$.next(value);
  }

  getNumberClick$(): Observable<NumberClickEvent> {
    return this.numberClick$.asObservable();
  }

  onFeatureClick(value: FeatureClickEvent): void {
    this.featureClick$.next(value);
  }

  getFeatureClick$(): Observable<FeatureClickEvent> {
    return this.featureClick$.asObservable();
  }
}
