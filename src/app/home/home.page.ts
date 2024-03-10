import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActionSheetButton, ActionSheetOptions, NavController } from '@ionic/angular';
import { GameStateService, Levels } from '../shared/services/game-state.service';
import { ConversionUtil } from '../shared/utils/conversion.util';
import { Subscription, combineLatest } from 'rxjs';
import { GameState } from '../shared/services/game-state.types';
import { Timestring } from '../shared/services/timer.types';

type ContinueOptions = {
  level: string;
  time: Timestring;
  mistakes: number;
}
@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage implements OnInit, OnDestroy {
  isMenuLevelOpen = false;
  // canContinue$ = this.gameStateServ.getContinueState$();
  canContinue: boolean = false;
  continueOptions!: ContinueOptions;
  menuLevelTitle = 'Choose difficulty level';
  menuLevelButtons = this.createActionSheetMenu();

  private _gameState!: GameState;
  private gameStateSub$: Subscription = combineLatest([
    this.gameStateServ.getPauseState$(),
    this.gameStateServ.getGameState$()
  ])
  .subscribe(([pauseState, gameState]) => {
    this._gameState = gameState;
    console.log('Save game state', gameState, 'Pause state', pauseState);
    this.gameStateServ.saveGameState(this._gameState);
    this.canContinue = true;
    this.setContinueOptions(gameState);
  });

  constructor(private navCtrl: NavController, private gameStateServ: GameStateService) {}

  ngOnInit(): void {
    console.log('HomePage OnInit');
    this.loadGameStateFromStorage();
  }

  ngOnDestroy(): void {
    this.gameStateSub$.unsubscribe();
  }

  loadGameStateFromStorage(): void {
    const gameState = this.gameStateServ.loadGameState();
    if(gameState) {
      console.log('Loaded game state', gameState);
      this.canContinue = true;
      this.setContinueOptions(gameState);
    } else {
      this.canContinue = false;
    }
  }

  private setContinueOptions(gamestate: GameState): void {
    this.continueOptions = {
      level: gamestate.level.name,
      mistakes: gamestate.mistakes,
      time: gamestate.timestring,
    }
  }

  onContinue(): void {
    this.navCtrl.navigateForward('game');
  }

  onNewGame(): void {
    this.gameStateServ.clearGameState();
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
