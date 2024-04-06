import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { NavController } from '@ionic/angular';
import { AppStateService } from '../../services/app-state.service';
import { BaseComponent } from '../../abstracts/base-component.abstract';
import { GameStateService } from '../../services/game-state.service';
import { CommonGameState, GameStartType } from '../../services/game-state.types';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
})
export class HeaderComponent extends BaseComponent implements OnInit, OnDestroy {
  @Input() showOptions: boolean = true;
  @Input() showThemes: boolean = false;
  @Input() showPause: boolean = false;
  @Input() showBack: boolean = false;
  @Input() backPath: string = '';
  @Input() parentPath: string = '';
  @Input() title: string = '';

  @Output() pauseClickEvent = new EventEmitter<boolean>();
  @Output() themeClickEvent = new EventEmitter<boolean>();
  @Output() optionsClickEvent = new EventEmitter<boolean>();
  @Output() backClickEvent = new EventEmitter<void>();

  @Input() isPaused: boolean = false;
  @Input() isThemesMenuVisible: boolean = false;
  isOptionsMenuVisible: boolean = false;
  private appDevMode: boolean = false;

  private readonly appDevModeSub$ = this.appStateServ.getAppDevMode$().subscribe((v) => (this.appDevMode = v));
  constructor(
    private navCtrl: NavController,
    private appStateServ: AppStateService,
    private readonly gameStateServ: GameStateService
  ) {
    super();
    this.registerSubscriptions([this.appDevModeSub$]);
  }

  ngOnInit(): void {
    console.log('Header on init');
  }

  ngOnDestroy(): void {
    this.unsubscribeSubscriptions();
  }

  async onBack(): Promise<void> {
    // if (this.showBack) {
    //   await this.navCtrl.navigateBack(this.);
    // }
    console.log('=== onBack backPath', this.backPath);
    if (this.showBack && this.backPath !== '') {
      switch (this.backPath) {
        case 'home':
          this.navCtrl.navigateBack(this.backPath);
          break;
        case 'game':
          const commonGameState = await this.getGameState();
          if (commonGameState.canContinue && commonGameState.gameState) {
            this.gameStateServ.setGameStartMode({
              type: GameStartType.CONTINUE,
              options: { banner: false },
              gameState: commonGameState.gameState,
            });
            this.gameStateServ.setLevel(commonGameState.gameState.level.name);
            this.navCtrl.navigateBack(this.backPath);
          }
          break;
        default:
          this.navCtrl.navigateBack(this.backPath);
      }
    }
  }

  onPause(): void {
    this.isPaused = !this.isPaused;
    this.pauseClickEvent.emit(this.isPaused);
  }

  onThemes(): void {
    this.isThemesMenuVisible = !this.isThemesMenuVisible;
    this.themeClickEvent.emit(this.isThemesMenuVisible);
  }

  onOptions(): void {
    this.navCtrl.navigateForward(['options'], { queryParams: { parent: this.parentPath } });
    // this.isOptionsMenuVisible = !this.isOptionsMenuVisible;
    // this.optionsClickEvent.emit(this.isOptionsMenuVisible);
  }

  onAppDevModeToggle(): void {
    this.appStateServ.setAppDevMode(!this.appDevMode);
  }

  private async getGameState(): Promise<CommonGameState> {
    const gameState = await this.gameStateServ.loadGameState();
    if (gameState && gameState.gameState) {
      return gameState;
    } else {
      return {
        canContinue: false,
      };
    }
    // if (gameState) {
    //   this.canContinue = gameState.canContinue;
    //   this._gameState = gameState.gameState;
    //   this.setContinueOptions(gameState.gameState);
    // } else {
    //   this.canContinue = false;
    // }
  }
}
