import { Component, OnDestroy } from '@angular/core';
import { AppStateService } from '../shared/services/app-state.service';
import { Subscription, tap } from 'rxjs';
import { GameLevel, GameStateService } from '../shared/services/game-state.service';
import { TimerService } from '../shared/services/timer.service';
import { InputMode } from '../shared/services/game-state.types';
import { PauseModalActionType } from './pause/pause.types';

@Component({
  selector: 'app-game',
  templateUrl: './game.page.html',
  styleUrls: ['./game.page.scss'],
})
export class GamePage implements OnDestroy {
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

  ngOnDestroy(): void {
    console.log('GamePage Destroy');
    this.inputModeSubs$.unsubscribe();
    this.pauseStateSub$.unsubscribe();
  }

  back(event: void): void {
    console.log('Back to menu: ', event);
    this.gameStateServ.setPauseState(true);
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
