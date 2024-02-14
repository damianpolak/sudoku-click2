import { Component, OnDestroy, OnInit } from '@angular/core';
import { ControlsService, FeatureClickEvent, Features } from './controls.service';
import { GameStateService } from 'src/app/shared/services/game-state.service';
import { Subscription } from 'rxjs';
import { InputMode } from 'src/app/shared/services/game-state.types';

@Component({
  selector: 'app-controls',
  templateUrl: './controls.component.html',
  styleUrls: ['./controls.component.scss'],
})
export class ControlsComponent implements OnInit, OnDestroy {
  inputMode!: InputMode;
  private inputModeSubs$!: Subscription;
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
    this.controlsServ.onFeatureClick(value);
  }

  onNumberClick(value: number): void {
    this.controlsServ.onNumberClick({
      mode: this.inputMode,
      number: value,
    });
  }
}
