import { Component, Input } from '@angular/core';
import { BaseComponent } from 'src/app/shared/abstracts/base-component.abstract';
import { GameStateService } from 'src/app/shared/services/game-state.service';
import { MistakeService } from 'src/app/shared/services/mistake.service';
import { ScoreService } from 'src/app/shared/services/score.service';
import { TimerService } from 'src/app/shared/services/timer.service';
import { ConversionUtil } from 'src/app/shared/utils/conversion.util';

@Component({
  selector: 'app-status-bar',
  templateUrl: './status-bar.component.html',
  styleUrls: ['./status-bar.component.scss'],
})
export class StatusBarComponent extends BaseComponent {
  @Input() visibleScore: boolean = false;

  get levelName() {
    return ConversionUtil.firstUpper(this.gameStateServ.selectedLevel.name);
  }

  get timestring() {
    return this.timerServ.getTimestring();
  }

  get mistakes() {
    return this.mistakeServ.getPresentMistakes();
  }

  get score() {
    return this.scoreServ.getPresentScore();
  }

  constructor(
    private gameStateServ: GameStateService,
    private timerServ: TimerService,
    private mistakeServ: MistakeService,
    private scoreServ: ScoreService
  ) {
    super();
  }
}
