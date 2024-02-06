import { Component } from '@angular/core';
import { ActionSheetButton, ActionSheetOptions, NavController } from '@ionic/angular';
import { GameStateService, Levels } from '../shared/services/game-state.service';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage {
  isMenuLevelOpen = false;
  canContinue = this.gameStateServ.getContinueState$();

  menuLevelTitle = 'Choose difficulty level';
  menuLevelButtons = this.createActionSheetMenu();

  constructor(private navCtrl: NavController, private gameStateServ: GameStateService) {}

  onContinue(): void {
    this.navCtrl.navigateForward('game');
  }

  onNewGame(): void {
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
        text: item,
        data: {
          selectedLevel: item,
        },
      };
    });
  }
}
