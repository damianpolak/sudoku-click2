import { Component, OnDestroy, OnInit } from '@angular/core';
import { ControlsService, FeatureClickEvent, Features } from './controls.service';
import { GameStateService } from 'src/app/shared/services/game-state.service';
import { Subscription, map, tap } from 'rxjs';
import { InputMode } from 'src/app/shared/services/game-state.types';

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
export class ControlsComponent implements OnInit, OnDestroy {
  inputMode!: InputMode;
  private inputModeSubs$!: Subscription;
  private numberSub$: Subscription = this.gameStateServ.getMissingNumbers$().pipe(map(x => {
    return x.map(i => {
      return {
        value: i.id,
        missingValue: i.value
      }
    })
  })).subscribe(v => {
    this._numbers = v;
  });

  private _numbers: NumberControl[] = [];

  get numbers() {
    return this._numbers;
  }

  features!: FeatureControl[]
  constructor(private controlsServ: ControlsService, private gameStateServ: GameStateService) {}

  ngOnInit() {
    this.inputModeSubs$ = this.gameStateServ.getInputMode$().subscribe((mode) => {
      this.inputMode = mode;
      this.features = this.featuresCreate();
    });
  }

  ngOnDestroy(): void {
    this.inputModeSubs$.unsubscribe();
    this.numberSub$.unsubscribe();
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
    ];
  }

  getFeatureToggleStyle(toggle: boolean | undefined) {
    if(typeof toggle === 'undefined') {
      return {
        color: 'inherit',
      }
    }
    return {'color':toggle === true ? 'var(--ion-color-primary)' : 'inherit' }
  }
}
