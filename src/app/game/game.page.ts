import { AfterViewInit, Component, OnDestroy, OnInit } from '@angular/core';
import { AppStateService } from '../shared/services/app-state.service';
import { Observable, Subscription, lastValueFrom } from 'rxjs';
import { GameLevel, GameStateService } from '../shared/services/game-state.service';
import { TimerService } from '../shared/services/timer.service';
import { FieldMode } from '../shared/services/game-state.types';

@Component({
  selector: 'app-game',
  templateUrl: './game.page.html',
  styleUrls: ['./game.page.scss'],
})
export class GamePage implements OnInit, OnDestroy {
  orientation = this.appStateServ.getScreenOrientation$();
  fieldMode!: FieldMode;
  private fieldModeSubs$: Subscription;

  level!: GameLevel;
  constructor(
    private appStateServ: AppStateService,
    private gameStateServ: GameStateService,
    private timerServ: TimerService
  ) {
    this.fieldModeSubs$ = this.gameStateServ.getFieldMode$().subscribe((x) => {
      this.fieldMode = x;
    });
    this.level = this.gameStateServ.selectedLevel;
  }

  ngOnInit(): void {
    this.timerServ.start();
    console.log('GamePage Init');
  }

  ngOnDestroy(): void {
    console.log('GamePage Destroy');
    this.fieldModeSubs$.unsubscribe();
    this.timerServ.restart();
  }

  toggleMode(): void {
    if (this.fieldMode === 'value') {
      this.gameStateServ.setFieldMode('notes');
    } else {
      this.gameStateServ.setFieldMode('value');
    }
  }

  // Timers toogle test
  timerStart(): void {
    this.timerServ.start();
  }

  timerStop(): void {
    this.timerServ.stop();
  }

  timerRestart(): void {
    this.timerServ.restart();
  }
}
