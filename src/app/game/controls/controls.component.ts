import { Component, OnDestroy, OnInit } from '@angular/core';
import { ControlsService, FeatureClickEvent, Features } from './controls.service';
import { GameStateService } from 'src/app/shared/services/game-state.service';
import { Subscription } from 'rxjs';
import { InputMode } from 'src/app/shared/services/game-state.types';

type NumberControl = {
  value: number;
  missingValue: number;
};

type FeatureControl = FeatureClickEvent & {
  name: string;
  iconDefault: string;
  iconToggle?: string;
};

@Component({
  selector: 'app-controls',
  templateUrl: './controls.component.html',
  styleUrls: ['./controls.component.scss'],
})
export class ControlsComponent implements OnInit, OnDestroy {
  inputMode!: InputMode;
  private inputModeSubs$!: Subscription;
  numbers: NumberControl[] = [
    { value: 1, missingValue: Math.round(Math.random() * 8) + 1 },
    { value: 2, missingValue: Math.round(Math.random() * 8) + 1 },
    { value: 3, missingValue: Math.round(Math.random() * 8) + 1 },
    { value: 4, missingValue: Math.round(Math.random() * 8) + 1 },
    { value: 5, missingValue: Math.round(Math.random() * 8) + 1 },
    { value: 6, missingValue: Math.round(Math.random() * 8) + 1 },
    { value: 7, missingValue: Math.round(Math.random() * 8) + 1 },
    { value: 8, missingValue: Math.round(Math.random() * 8) + 1 },
    { value: 9, missingValue: Math.round(Math.random() * 8) + 1 },
  ];

  features: FeatureControl[] = [
    { name: 'Back', type: 'click', feature: 'back', iconDefault: 'arrow-back-circle-outline' },
    { name: 'Erase', type: 'click', feature: 'erase', iconDefault: 'close-circle-outline' },
    {
      name: 'Notes',
      type: 'toggle',
      feature: 'notes',
      iconDefault: 'document-outline',
      iconToggle: 'document-text-outline',
    },
    { name: 'Tip', type: 'click', feature: 'tip', iconDefault: 'bulb-outline' },
  ];
  constructor(private controlsServ: ControlsService, private gameStateServ: GameStateService) {}

  ngOnInit() {
    this.inputModeSubs$ = this.gameStateServ.getInputMode$().subscribe((mode) => {
      this.inputMode = mode;
    });
  }

  ngOnDestroy(): void {
    this.inputModeSubs$.unsubscribe();
  }

  onFeatureClick(value: FeatureClickEvent): void {
    console.log('feature', value);
    this.controlsServ.onFeatureClick(value);
  }

  onNumberClick(value: number): void {
    this.controlsServ.onNumberClick({
      mode: this.inputMode,
      number: value,
    });
  }
}
