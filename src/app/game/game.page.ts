import { AfterViewInit, Component, OnDestroy, OnInit } from '@angular/core';
import { AppStateService } from '../shared/services/app-state.service';
import { Observable, Subscription, lastValueFrom } from 'rxjs';
import { GameLevel, GameStateService } from '../shared/services/game-state.service';
import { TimerService } from '../shared/services/timer.service';
import { InputMode } from '../shared/services/game-state.types';
import { PauseModalActionType } from './pause/pause.types';

@Component({
  selector: 'app-game',
  templateUrl: './game.page.html',
  styleUrls: ['./game.page.scss'],
})
export class GamePage implements OnInit, OnDestroy {
  orientation$ = this.appStateServ.getScreenOrientation$();
  inputMode!: InputMode;
  private inputModeSubs$: Subscription;

  isPaused: boolean = true;
  level!: GameLevel;
  constructor(
    private appStateServ: AppStateService,
    private gameStateServ: GameStateService,
    private timerServ: TimerService
  ) {
    this.inputModeSubs$ = this.gameStateServ.getInputMode$().subscribe((mode) => {
      this.inputMode = mode;
    });
    this.level = this.gameStateServ.selectedLevel;
  }

  ngOnInit(): void {
    this.timerServ.start();
  }

  ngOnDestroy(): void {
    this.inputModeSubs$.unsubscribe();
    this.timerServ.restart();
  }

  // Timers toogle test
  timerStart(): void {
    this.timerServ.start();
  }

  timerStop(): void {
    this.timerServ.stop();
  }

  timerRestart(): void {
    this.timerServ.restart();
  }

  pause(event: boolean): void {
    this.isPaused = event;
  }

  onPauseModalDismiss(event: PauseModalActionType): void {
    this.isPaused = false;
  }
}
