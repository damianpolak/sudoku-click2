import { Component } from '@angular/core';
import { ActionSheetButton, NavController } from '@ionic/angular';
import { GameStateService, Levels } from '../shared/services/game-state.service';
import { ConversionUtil } from '../shared/utils/conversion.util';
import { Subscription, combineLatest } from 'rxjs';
import { GameStartType, GameState, GameStatusType } from '../shared/services/game-state.types';
import { Timestring } from '../shared/services/timer.types';
import { BaseComponent } from '../shared/abstracts/base-component.abstract';

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
  menuLevelButtons = this.createActionSheetMenu();

  private _gameState!: GameState;
  private gameStateSub$!: Subscription;

  constructor(private navCtrl: NavController, private gameStateServ: GameStateService) {
    super();
  }

  ionViewDidEnter(): void {
    console.log('=== HomePageDidEnter');
    this.gameStateSub$ = combineLatest([
      this.gameStateServ.getPauseState$(),
      this.gameStateServ.getGameState$(),
    ]).subscribe(([pauseState, gameState]) => {
      console.log('=== ionViewDidEnter');
      this.canContinue = true;
      this._gameState = gameState;
      this.setContinueOptions(gameState);
    });
    this.registerSubscriptions([this.gameStateSub$]);
    this.loadGameState();
  }

  ionViewDidLeave(): void {
    console.log('=== HomePageDidLeave');
    this.unsubscribeSubscriptions();
  }

  private async loadGameState(): Promise<void> {
    const gameState = await this.gameStateServ.loadGameState();
    if (gameState && this.isGamePlayable(gameState)) {
      this.canContinue = true;
      this._gameState = gameState;
      this.setContinueOptions(gameState);
    } else if (gameState && !this.isGamePlayable(gameState)) {
      await this.gameStateServ.clearGameState();
    } else {
      this.canContinue = false;
    }
  }

  private isGamePlayable(gameState: GameState): boolean {
    return gameState.state === GameStatusType.PENDING;
  }

  private setContinueOptions(gamestate: GameState): void {
    this.continueOptions = {
      level: gamestate.level.name,
      mistakes: gamestate.mistakes.length,
      time: gamestate.timestring,
    };
  }

  onContinue(): void {
    this.gameStateServ.setGameStartMode({
      type: GameStartType.CONTINUE,
      gameState: this._gameState,
    });
    this.gameStateServ.setLevel(this._gameState.level.name);
    this.navCtrl.navigateForward('game');
  }

  async onNewGame(): Promise<void> {
    await this.gameStateServ.clearGameState();
    this.gameStateServ.setGameStartMode({
      type: GameStartType.NEW_GAME,
    });
    this.navCtrl.navigateForward('game');
  }

  openMenuLevel(isOpen: boolean): void {
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
    return Object.keys(Levels).map((item) => {
      return {
        text: ConversionUtil.firstUpper(item),
        data: {
          selectedLevel: item,
        },
      };
    });
  }
}
