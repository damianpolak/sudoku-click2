import { Component } from '@angular/core';
import { NavController } from '@ionic/angular';
import { GameStateService } from '../shared/services/game-state.service';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage {

  isMenuLevelOpen = false;
  canContinue = this.gameStateServ.getContinueState$();

  menuLevelTitle = 'Choose difficulty level';
  menuLevelButtons = [
    {
      text: 'Delete',
      role: 'destructive',
      data: {
        action: 'delete',
      },
    },
    {
      text: 'Share',
      data: {
        action: 'share',
      },
    },
    {
      text: 'Cancel',
      role: 'cancel',
      data: {
        action: 'cancel',
      },
    },
  ];

  constructor(private navCtrl: NavController, private gameStateServ: GameStateService) {}

  onContinue(): void {
    console.log('continue');
  }

  onNewGame(): void {
    this.navCtrl.navigateForward('game');
  }

  openMenuLevel(isOpen: boolean): void {
    this.isMenuLevelOpen = isOpen;
  }
}
