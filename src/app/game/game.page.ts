import { Component, OnDestroy } from '@angular/core';
import { AppStateService } from '../shared/services/app-state.service';
import { Subscription, combineLatest, map, tap } from 'rxjs';
import { GameLevel, GameStateService } from '../shared/services/game-state.service';
import { TimerService } from '../shared/services/timer.service';
import { GameStartType, InputMode } from '../shared/services/game-state.types';
import { PauseModalActionType } from './pause/pause.types';
import { MistakeService } from '../shared/services/mistake.service';
import { FinishGame, FinishGameType } from '../shared/components/fullscreen-view/fullscreen-view.types';
import { HistoryService } from '../shared/services/history.service';
import { BaseComponent } from '../shared/abstracts/base-component.abstract';

@Component({
  selector: 'app-game',
  templateUrl: './game.page.html',
  styleUrls: ['./game.page.scss'],
})
export class GamePage extends BaseComponent implements OnDestroy {
  orientation$ = this.appStateServ.getScreenOrientation$();
  inputMode!: InputMode;
  isPaused!: boolean;
  isFinalViewOpen: boolean = false;
  level!: GameLevel;
  title: string = 'Sudoku.click';

  private gameStateSub$: Subscription = this.gameStateServ
    .getGameState$()
    .subscribe((gameState) => this.gameStateServ.saveGameState(gameState));

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

  gameFinished: FinishGame = { title: '', description: '' };

  private finishGameSub$: Subscription = combineLatest([
    this.gameStateServ.getWin$(),
    this.mistakeServ.getPresentMistakes(),
  ])
    .pipe(
      map(([isWin, presentMistake]) => {
        return isWin === true
          ? FinishGameType.VICTORY
          : presentMistake.value >= presentMistake.limit
          ? FinishGameType.LOSS
          : undefined;
      })
    )
    .subscribe((finishGameType) => {
      if (finishGameType === FinishGameType.VICTORY) {
        this.onFinishGameScreen({
          title: 'Congratulations',
          description: 'You found the solution!',
          finishType: FinishGameType.VICTORY,
        });
      } else if (finishGameType === FinishGameType.LOSS) {
        this.onFinishGameScreen({
          title: 'Game over',
          description: 'You made 3 mistakes!',
          finishType: FinishGameType.LOSS,
        });
      }
    });

  constructor(
    private appStateServ: AppStateService,
    private gameStateServ: GameStateService,
    private timerServ: TimerService,
    private historyServ: HistoryService,
    private mistakeServ: MistakeService
  ) {
    super();
    this.registerSubscriptions([this.inputModeSubs$, this.pauseStateSub$, this.finishGameSub$, this.gameStateSub$]);
    this.level = this.gameStateServ.selectedLevel;
  }

  ngOnDestroy(): void {
    console.log('GamePage Destroy');
    this.unsubscribeSubscriptions();
    this.mistakeServ.clear();
    this.historyServ.clear();
    this.timerServ.stop();
  }

  back(event: void): void {
    console.log('Back to menu: ', event);
    this.gameStateServ.setPauseState(true);
  }

  pause(event: boolean): void {
    this.gameStateServ.setPauseState(event);
  }

  onPauseModalDismiss(event: PauseModalActionType): void {
    switch (event) {
      case 'RESTART':
        this.gameStateServ.setGameStartMode({
          type: GameStartType.RESTART_GAME,
        });
        break;
      default:
        this.gameStateServ.setPauseState(false);
    }
  }

  onFinishGameScreenClose(): void {
    this.isFinalViewOpen = false;
  }

  private onFinishGameScreen(finishGameObj: FinishGame): void {
    this.timerServ.stop();
    this.isFinalViewOpen = true;
    this.gameFinished = { ...finishGameObj };
  }
}
