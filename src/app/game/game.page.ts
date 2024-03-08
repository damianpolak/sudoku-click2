import { AfterViewInit, Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { AppStateService } from '../shared/services/app-state.service';
import { Observable, Subscription, lastValueFrom, tap } from 'rxjs';
import { GameLevel, GameStateService } from '../shared/services/game-state.service';
import { TimerService } from '../shared/services/timer.service';
import { InputMode } from '../shared/services/game-state.types';
import { PauseModalActionType } from './pause/pause.types';
import { HeaderComponent } from '../shared/components/header/header.component';

@Component({
  selector: 'app-game',
  templateUrl: './game.page.html',
  styleUrls: ['./game.page.scss'],
})
export class GamePage implements OnInit, OnDestroy {
  orientation$ = this.appStateServ.getScreenOrientation$();
  inputMode!: InputMode;
  isPaused!: boolean;
  level!: GameLevel;
  title: string = 'Sudoku.click';

  private inputModeSubs$: Subscription = this.gameStateServ.getInputMode$().subscribe((mode) => {
    this.inputMode = mode;
  });

  private pauseStateSub$: Subscription = this.gameStateServ
    .getPauseState$()
    .pipe(
      tap((state) => {
        if (state) {
          this.timerServ.stop();
        } else {
          this.timerServ.start();
        }
      })
    )
    .subscribe((pause) => {
      this.isPaused = pause;
    });

  constructor(
    private appStateServ: AppStateService,
    private gameStateServ: GameStateService,
    private timerServ: TimerService
  ) {
    this.level = this.gameStateServ.selectedLevel;
  }

  ngOnInit(): void {
    console.log();
  }

  ngOnDestroy(): void {
    this.inputModeSubs$.unsubscribe();
    this.pauseStateSub$.unsubscribe();
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
    this.gameStateServ.setPauseState(event);
  }

  onPauseModalDismiss(event: PauseModalActionType): void {
    // 'CONTINUE' | 'RESTART' | 'CANCELGAME' | 'DISMISS';
    switch (event) {
      case 'CANCELGAME':
        console.log('Game is cancelled');
        break;
      case 'RESTART':
        console.log('Game is restarted');
        break;
      default:
        this.gameStateServ.setPauseState(false);
    }
  }
}
