import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  EventEmitter,
  HostBinding,
  Input,
  OnChanges,
  OnDestroy,
  OnInit,
  Output,
  SimpleChanges,
} from '@angular/core';
import { Animation, NavController } from '@ionic/angular';
import { FinishGameType } from './fullscreen-view.types';
import { Animated } from '../../interfaces/core.interface';
import { GameStateService } from '../../services/game-state.service';
import { BurstModeType, GameStartType, GameStatusType, InputModeType } from '../../services/game-state.types';
import { Observable, Subscription, tap } from 'rxjs';
import { BaseComponent } from '../../abstracts/base-component.abstract';
import { MistakeService } from '../../services/mistake.service';
import { TimerService } from '../../services/timer.service';
import { HistoryService } from '../../services/history.service';
import { ControlsService } from 'src/app/game/controls/controls.service';
import { FullscreenViewAnimation } from '../../animations/fullscreen-view.animation';
import { Timestring } from '../../services/timer.types';
import { ScoreService } from '../../services/score.service';
import { StatsService } from 'src/app/options/stats/stats.service';

@Component({
  selector: 'app-fullscreen-view',
  templateUrl: './fullscreen-view.component.html',
  styleUrls: ['./fullscreen-view.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FullscreenViewComponent extends BaseComponent implements Animated, OnDestroy, OnChanges {
  @Input() isOpen: boolean = true;
  @Input() title: string = '';
  @Input() description: string = '';
  @Input() durationTime: number = 1000;
  @Input() finishType: FinishGameType | undefined;
  @Output() closeEvent: EventEmitter<void> = new EventEmitter<void>();

  timeString: Observable<Timestring> = this.timerServ.getTimestring();
  score: Observable<number> = this.scoreServ.getPresentScore();
  canSecondChance: Observable<boolean> = this.mistakeServ.canUseSecondChance();

  @HostBinding('class.hide') get isHidden() {
    return !this.isOpen;
  }

  animationsEnabled: boolean = true;
  private animation!: Animation;

  private readonly gameStartModeSub$: Subscription = this.gameStateServ
    .getGameStartMode$()
    .pipe(
      tap((gameStartMode) => {
        this.onClose();
      })
    )
    .subscribe();

  constructor(
    private readonly gameStateServ: GameStateService,
    private readonly ref: ElementRef,
    private readonly navCtrl: NavController,
    private readonly mistakeServ: MistakeService,
    private readonly scoreServ: ScoreService,
    private readonly timerServ: TimerService,
    private readonly controlsServ: ControlsService,
    private readonly statsServ: StatsService
  ) {
    super();
    this.registerSubscriptions([this.gameStartModeSub$]);
  }

  ngOnDestroy(): void {
    this.unsubscribeSubscriptions();
  }

  async ngOnChanges(changes: SimpleChanges): Promise<void> {
    this.setAnimation();
    if ('isOpen' in changes) {
      if (this.isOpen) {
        await this.animation.play();
        this.animation.stop();
      }
    }
  }

  getFinishGameClassType() {
    switch (this.finishType) {
      case FinishGameType.VICTORY:
        return 'victory-background';
      case FinishGameType.LOSS:
        return 'loss-background';
      default:
        return 'default-background';
    }
  }

  onClose(): void {
    this.isOpen = false;
    this.closeEvent.emit();
  }

  onRestartGame(): void {
    this.gameStateServ.setGameStartMode({
      type: GameStartType.RESTART_GAME,
    });
  }

  async onSecondChance(): Promise<void> {
    this.mistakeServ.secondChance();
    this.gameStateServ.setInputMode(InputModeType.VALUE);
    this.gameStateServ.setBurstMode(BurstModeType.NORMAL);
    this.controlsServ.onFeatureClick({
      type: 'click',
      feature: 'back',
    });
    this.timerServ.start();
    this.gameStateServ.setGameStartMode({
      type: GameStartType.SECOND_CHANCE,
    });
    await this.statsServ.removeLast();
  }

  navigateHome(): void {
    this.gameStateServ.clearGameState();
    this.navCtrl.navigateBack('home');
  }

  async onStatistics(): Promise<void> {
    await this.gameStateServ.clearGameState();
    await this.navCtrl.navigateForward('options/stats', { queryParams: { parent: 'home' } });
  }

  setAnimation(): void {
    this.animation = new FullscreenViewAnimation(this.ref.nativeElement, {
      duration: this.durationTime,
      beforeAddClass: this.getFinishGameClassType(),
    }).getAnimation();
  }
}
