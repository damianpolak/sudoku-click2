import { Component } from '@angular/core';
import { NavController } from '@ionic/angular';
import { GameStateService } from '../shared/services/game-state.service';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage {

  canContinue = this.gameStateServ.getContinueState$();
  constructor(private navCtrl: NavController, private gameStateServ: GameStateService) {}

  onContinue(): void {
    console.log('continue');
  }

  onNewGame(): void {
    this.navCtrl.navigateForward('game');
  }
}
