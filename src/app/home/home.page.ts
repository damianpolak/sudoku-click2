import { AfterViewInit, Component } from '@angular/core';
import { ActionSheetButton, NavController } from '@ionic/angular';
import { GameStateService, Level } from '../shared/services/game-state.service';
import { ConversionUtil } from '../shared/utils/conversion.util';
import { Observable, Subscription, combineLatest } from 'rxjs';
import { GameStartType, GameState, GameStatusType } from '../shared/services/game-state.types';
import { BaseComponent } from '../shared/abstracts/base-component.abstract';
import { Timestring } from '../shared/services/timer.types';
import { StatsService } from '../options/stats/stats.service';
import { AppStateService } from '../shared/services/app-state.service';
import { Build } from '../shared/interfaces/core.interface';
import { Action } from 'rxjs/internal/scheduler/Action';

type ContinueOptions = {
  level: string;
  time: Timestring;
  mistakes: number;
};
@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage extends BaseComponent {
  isMenuLevelOpen = false;
  canContinue: boolean = false;
  continueOptions!: ContinueOptions;
  menuLevelTitle = 'Choose difficulty level';
  menuLevelButtons!: ActionSheetButton[];

  private _gameState?: GameState;
  private gameStateSub$!: Subscription;
  private devModeSub$!: Subscription;
  private _devMode: boolean = false;

  get buildVersion(): Observable<Build> {
    return this.appStateServ.getBuildVersionFile$();
  }

  get devMode(): boolean {
    return this._devMode;
  }

  constructor(
    private readonly navCtrl: NavController,
    private readonly gameStateServ: GameStateService,
    private readonly appStateServ: AppStateService
  ) {
    super();
  }

  async ionViewDidEnter(): Promise<void> {
    this.gameStateSub$ = combineLatest([
      this.gameStateServ.getPauseState$(),
      this.gameStateServ.getGameState$(),
    ]).subscribe(([pauseState, gameState]) => {
      this.canContinue = true;
      this._gameState = gameState;
      this.setContinueOptions(gameState);
    });

    this.devModeSub$ = this.appStateServ.getAppDevMode$().subscribe((v) => {
      this._devMode = v;
      this.menuLevelButtons = this.createActionSheetMenu();
    });

    this.registerSubscriptions([this.gameStateSub$, this.devModeSub$]);
    await this.loadGameState();
  }

  ionViewDidLeave(): void {
    this.unsubscribeSubscriptions();
  }

  private async loadGameState(): Promise<void> {
    const gameState = await this.gameStateServ.loadGameState();
    if (gameState) {
      this.canContinue = gameState.canContinue;
      this._gameState = gameState.gameState;
      this.setContinueOptions(gameState.gameState);
    } else {
      this.canContinue = false;
    }
  }

  private setContinueOptions(gamestate?: GameState): void {
    if (gamestate) {
      this.continueOptions = {
        level: gamestate.level.name,
        mistakes: gamestate.mistakes.length,
        time: gamestate.timestring,
      };
    }
  }

  onContinue(): void {
    this.appStateServ.onMainMenuButtonClick();
    this.gameStateServ.setGameStartMode({
      type: GameStartType.CONTINUE,
      gameState: this._gameState,
    });
    if (this._gameState) {
      this.gameStateServ.setLevel(this._gameState.level.name);
      this.navCtrl.navigateForward('game', { queryParams: { parent: 'home' } });
    }
  }

  async onNewGame(): Promise<void> {
    this.appStateServ.onMainMenuButtonClick();
    await this.gameStateServ.clearGameState();
    this.gameStateServ.setGameStartMode({
      type: GameStartType.NEW_GAME,
    });
    this.navCtrl.navigateForward('game', { queryParams: { parent: 'home' } });
  }

  openMenuLevel(isOpen: boolean): void {
    this.appStateServ.onMainMenuButtonClick();
    this.isMenuLevelOpen = isOpen;
  }

  onMenuLevelDismiss(event: CustomEvent): void {
    const eventDetail = event.detail.data;
    if (eventDetail) {
      this.gameStateServ.setLevel(eventDetail.selectedLevel);
      this.onNewGame();
    }
    this.openMenuLevel(false);
  }

  createActionSheetMenu(): ActionSheetButton[] {
    return Object.keys(Level)
      .map((item) => {
        return {
          text: ConversionUtil.firstUpper(item),
          data: {
            selectedLevel: item,
          },
        };
      })
      .filter((item) => {
        return this.devMode ? true : !item.text.toUpperCase().includes('DEV');
      });
  }
}
