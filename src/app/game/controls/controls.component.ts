import { Component, OnDestroy, OnInit } from '@angular/core';
import { ControlsService } from './controls.service';
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

  onBackClick(): void {}

  onEraseClick(): void {}

  onNotesToggle(): void {
    if (this.inputMode === 'value') {
      this.gameStateServ.setInputMode('notes');
    } else {
      this.gameStateServ.setInputMode('value');
    }
  }

  onTipClick(): void {}

  onNumberClick(value: number): void {
    this.controlsServ.onNumberClick({
      mode: this.inputMode,
      number: value,
    });
  }
}
