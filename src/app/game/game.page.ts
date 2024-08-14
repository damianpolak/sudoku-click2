import { Component } from '@angular/core';
import { AppStateService } from '../shared/services/app-state.service';
import { Subscription, combineLatest, distinctUntilChanged, map, pipe, tap, withLatestFrom } from 'rxjs';
import { GameLevel, GameStateService } from '../shared/services/game-state.service';
import { TimerService } from '../shared/services/timer.service';
import { GameStartType, GameStatusType, InputModeType } from '../shared/services/game-state.types';
import { PauseModalActionType } from './pause/pause.types';
import { MistakeService } from '../shared/services/mistake.service';
import { FinishGame, FinishGameType } from '../shared/components/fullscreen-view/fullscreen-view.types';
import { HistoryService } from '../shared/services/history.service';
import { BaseComponent } from '../shared/abstracts/base-component.abstract';
import { ScoreService } from '../shared/services/score.service';
import { ThemeModalActionType } from './theme/theme.types';
import { StatsService } from '../options/stats/stats.service';

@Component({
  selector: 'app-game',
  templateUrl: './game.page.html',
  styleUrls: ['./game.page.scss'],
})
export class GamePage extends BaseComponent {
  orientation$ = this.appStateServ.getScreenOrientation$();
  inputMode!: InputModeType;
  isPaused: boolean = false;
  isThemeMenuVisible: boolean = false;
  isFinalViewOpen: boolean = false;
  level!: GameLevel;
  title: string = 'Sudoku.click';
  gameFinished: FinishGame = { title: '', description: '' };

  private gameStateSub$!: Subscription;
  private inputModeSubs$!: Subscription;
  private pauseStateSub$!: Subscription;
  private finishGameSub$!: Subscription;

  constructor(
    private readonly appStateServ: AppStateService,
    private readonly gameStateServ: GameStateService,
    private readonly timerServ: TimerService,
    private readonly scoreServ: ScoreService,
    private readonly historyServ: HistoryService,
    private readonly mistakeServ: MistakeService,
    private readonly statsServ: StatsService
  ) {
    super();
  }

  ionViewDidEnter(): void {
    ('GamePage DidEnter');
    this.gameStateSub$ = this.gameStateServ
      .getGameState$()
      .subscribe((gameState) => this.gameStateServ.saveGameState(gameState));

    this.inputModeSubs$ = this.gameStateServ.getInputMode$().subscribe((mode) => {
      this.inputMode = mode;
    });

    this.pauseStateSub$ = this.gameStateServ
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

    this.finishGameSub$ = combineLatest([
      this.scoreServ.getPresentScore().pipe(distinctUntilChanged()),
      this.mistakeServ.getPresentMistakes().pipe(distinctUntilChanged()),
      this.timerServ.getTimestring().pipe(distinctUntilChanged()),
    ])
      .pipe(
        withLatestFrom(this.gameStateServ.getGameStatus$()),
        pipe(
          map(([[score, mistake, timer], status]) => {
            return { score, mistake, timer, status };
          })
        )
      )
      .subscribe(async (v) => {
        if (v.status === GameStatusType.VICTORY) {
          this.onFinishGameScreen({
            title: 'Congratulations',
            description: 'You found the solution!',
            finishType: FinishGameType.VICTORY,
          });
          await this.statsServ.save({
            level: this.level.name,
            status: GameStatusType.VICTORY,
            score: v.score,
            time: v.timer,
            mistakes: v.mistake.value,
            statsable: v.mistake.limit > 0,
            datetime: new Date(),
          });
        } else if (v.status === GameStatusType.LOSS) {
          this.onFinishGameScreen({
            title: 'Game over',
            description: 'You made 3 mistakes!',
            finishType: FinishGameType.LOSS,
          });
          await this.statsServ.save({
            level: this.level.name,
            status: GameStatusType.LOSS,
            score: v.score,
            time: v.timer,
            mistakes: v.mistake.value,
            statsable: v.mistake.limit > 0,
            datetime: new Date(),
          });
        } else if (v.status === GameStatusType.PENDING) {
          if (this.isFinalViewOpen) {
            this.timerServ.stop();
            this.isFinalViewOpen = false;
          }
        }
      });

    this.registerSubscriptions([this.inputModeSubs$, this.pauseStateSub$, this.finishGameSub$, this.gameStateSub$]);
    this.level = this.gameStateServ.selectedLevel;
  }

  ionViewDidLeave(): void {
    this.unsubscribeSubscriptions();
    this.mistakeServ.clear();
    this.historyServ.clear();
    this.scoreServ.clear();
    this.timerServ.stop();
  }

  back(event: void): void {
    this.gameStateServ.setPauseState(true);
  }

  pause(event: boolean): void {
    this.gameStateServ.setPauseState(event);
  }

  themes(event: boolean): void {
    this.isThemeMenuVisible = event;
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

  onThemeModalDismiss(event: ThemeModalActionType): void {
    switch (event) {
      case 'THEME':
        break;
      default:
        this.isThemeMenuVisible = false;
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
