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
import { Animation, AnimationController, NavController } from '@ionic/angular';
import { FinishGameType } from './fullscreen-view.types';
import { Animated } from '../../interfaces/core.interface';
import { GameStateService } from '../../services/game-state.service';
import { GameStartType, GameStatusType } from '../../services/game-state.types';
import { Subscription, tap } from 'rxjs';
import { BaseComponent } from '../../abstracts/base-component.abstract';
import { MistakeService } from '../../services/mistake.service';
import { TimerService } from '../../services/timer.service';
import { HistoryService } from '../../services/history.service';
import { ControlsService } from 'src/app/game/controls/controls.service';

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

  @HostBinding('class.hide') get isHidden() {
    return !this.isOpen;
  }

  animationsEnabled: boolean = true;
  private bannerAnimation!: Animation;

  private readonly gameStartModeSub$: Subscription = this.gameStateServ
    .getGameStartMode$()
    .pipe(
      tap((gameStartMode) => {
        this.onClose();
      })
    )
    .subscribe();

  constructor(
    private animationCtrl: AnimationController,
    private gameStateServ: GameStateService,
    private ref: ElementRef,
    private navCtrl: NavController,
    private mistakeServ: MistakeService,
    private historyServ: HistoryService,
    private timerServ: TimerService,
    private controlsServ: ControlsService
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
        await this.bannerAnimation.play();
        this.bannerAnimation.stop();
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

  onSecondChance(): void {
    this.mistakeServ.secondChance();
    this.controlsServ.onFeatureClick({
      type: 'click',
      feature: 'back',
    });
    this.timerServ.start();
    this.gameStateServ.setGameStartMode({
      type: GameStartType.SECOND_CHANCE,
    });
    // this.gameStateServ.setGameStatus(GameStatusType.PENDING);
    console.log('Second chance');
  }

  navigateHome(): void {
    this.gameStateServ.clearGameState();
    this.navCtrl.navigateBack('home');
  }

  onStatistics(): void {
    console.log('Open stats');
  }

  setAnimation(): void {
    this.bannerAnimation = this.animationCtrl
      .create()
      .addElement(this.ref.nativeElement)
      .fill('none')
      .duration(this.durationTime)
      .fromTo('transform', 'scale(0)', 'scale(1)')
      .beforeAddClass(this.getFinishGameClassType())
      .keyframes([
        { offset: 0.0, opacity: '0.0' },
        { offset: 0.5, opacity: '0.5' },
        { offset: 1.0, opacity: '1.0' },
      ]);
  }
}
