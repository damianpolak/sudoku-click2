import { AfterViewInit, Component, HostBinding, Input, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { AppStateService } from 'src/app/shared/services/app-state.service';
import { BasicOrientationType } from 'src/app/shared/services/app-state.types';
import { GameLevel, GameStateService } from 'src/app/shared/services/game-state.service';
import { MistakeService, PresentMistake } from 'src/app/shared/services/mistake.service';
import { ResizeObservableService } from 'src/app/shared/services/resize-observable.service';
import { TimerService } from 'src/app/shared/services/timer.service';
import { ConversionUtil } from 'src/app/shared/utils/conversion.util';

@Component({
  selector: 'app-status-bar',
  templateUrl: './status-bar.component.html',
  styleUrls: ['./status-bar.component.scss'],
})
export class StatusBarComponent {
  get levelName() {
    return ConversionUtil.firstUpper(this.gameStateServ.selectedLevel.name);
  }

  get timestring() {
    return this.timerServ.getTimestring();
  }

  get mistakes() {
    return this.mistakeServ.getPresentMistakes();
  }

  constructor(
    private gameStateServ: GameStateService,
    private timerServ: TimerService,
    private mistakeServ: MistakeService
  ) {}
}
