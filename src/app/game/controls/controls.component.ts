import { Component, OnDestroy, OnInit } from '@angular/core';
import { ControlsService, FeatureClickEvent } from './controls.service';
import { GameStateService } from 'src/app/shared/services/game-state.service';
import { Subscription, combineLatest, map } from 'rxjs';
import { BurstModeType, InputMode } from 'src/app/shared/services/game-state.types';
import { BaseComponent } from 'src/app/shared/abstracts/base-component.abstract';

type NumberControl = {
  value: number;
  missingValue: number;
};

type FeatureControl = FeatureClickEvent & {
  name: string;
  icon: string;
  toggle?: boolean;
};

@Component({
  selector: 'app-controls',
  templateUrl: './controls.component.html',
  styleUrls: ['./controls.component.scss'],
})
export class ControlsComponent extends BaseComponent implements OnInit, OnDestroy {
  private inputMode!: InputMode;
  private burstMode!: BurstModeType;
  private interractionModeSub$!: Subscription;
  private numberSub$: Subscription = this.gameStateServ
    .getMissingNumbers$()
    .pipe(
      map((x) => {
        return x.map((i) => {
          return {
            value: i.id,
            missingValue: i.value,
          };
        });
      })
    )
    .subscribe((v) => {
      this._numbers = v;
    });

  private _numbers: NumberControl[] = [];

  get numbers() {
    return this._numbers;
  }

  features!: FeatureControl[];
  constructor(private controlsServ: ControlsService, private gameStateServ: GameStateService) {
    super();
  }

  ngOnInit() {
    this.interractionModeSub$ = combineLatest([
      this.gameStateServ.getInputMode$(),
      this.gameStateServ.getBurstMode$(),
    ]).subscribe(([input, burst]) => {
      this.inputMode = input;
      this.burstMode = burst;
      this.features = this.featuresCreate();
    });
    this.registerSubscriptions([this.interractionModeSub$, this.numberSub$]);
  }

  ngOnDestroy(): void {
    this.unsubscribeSubscriptions();
  }

  onFeatureClick(value: FeatureClickEvent): void {
    this.controlsServ.onFeatureClick(value);
  }

  onNumberClick(value: number): void {
    this.controlsServ.onNumberClick({
      mode: this.inputMode,
      number: value,
    });
  }

  private featuresCreate(): FeatureControl[] {
    return [
      { name: 'Undo', type: 'click', feature: 'back', icon: 'arrow-back-circle-outline' },
      { name: 'Erase', type: 'click', feature: 'erase', icon: 'close-circle-outline' },
      {
        name: 'Notes',
        type: 'toggle',
        feature: 'notes',
        icon: this.inputMode === 'value' ? 'document-outline' : 'document-text-outline',
        toggle: this.inputMode === 'notes',
      },
      { name: 'Tip', type: 'click', feature: 'tip', icon: 'bulb-outline' },
      {
        name: 'Burst',
        type: 'toggle',
        feature: 'burst',
        icon: this.burstMode === BurstModeType.NORMAL ? 'square-outline' : 'apps-outline',
        toggle: this.burstMode === BurstModeType.BURST,
      },
    ];
  }

  getFeatureToggleStyle(toggle: boolean | undefined) {
    if (typeof toggle === 'undefined') {
      return {
        color: 'inherit',
      };
    }
    return { color: toggle === true ? 'var(--ion-color-primary)' : 'inherit' };
  }
}
