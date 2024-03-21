import { Component } from '@angular/core';
import { BaseComponent } from 'src/app/shared/abstracts/base-component.abstract';
import { GameStateService } from 'src/app/shared/services/game-state.service';
import { MistakeService } from 'src/app/shared/services/mistake.service';
import { TimerService } from 'src/app/shared/services/timer.service';
import { ConversionUtil } from 'src/app/shared/utils/conversion.util';

@Component({
  selector: 'app-status-bar',
  templateUrl: './status-bar.component.html',
  styleUrls: ['./status-bar.component.scss'],
})
export class StatusBarComponent extends BaseComponent {
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
  ) {
    super();
  }
}
