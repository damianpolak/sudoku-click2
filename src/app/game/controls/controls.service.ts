import { Injectable, OnDestroy } from '@angular/core';
import { Observable, Subject, Subscription } from 'rxjs';
import { GameStateService } from 'src/app/shared/services/game-state.service';
import { InputMode } from 'src/app/shared/services/game-state.types';

export type NumberClickEvent = {
  mode: InputMode;
  number: number;
};

export type FeatureClickEvent = {
  type: FeatureClickType;
  feature: Features;
  toggle?: boolean;
};

type FeatureClickType = 'click' | 'toggle';

export type Features = 'back' | 'erase' | 'notes' | 'tip';

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
