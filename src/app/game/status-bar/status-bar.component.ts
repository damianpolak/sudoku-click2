import { Component, HostBinding, Input } from '@angular/core';
import { OptionsService } from 'src/app/options/options.service';
import { ToggleOption } from 'src/app/options/options.types';
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
  @Input() ignoreOptions: boolean = false;

  @HostBinding('style.display') get display() {
    return !this.canShowDifficulty && !this.canShowTimer && !this.canShowScore && !this.canShowMistakes
      ? 'none'
      : 'flex';
  }

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

  get canShowDifficulty(): boolean {
    return this.ignoreOptions ? true : this.optionsServ.getValueById(ToggleOption.SHOW_DIFFICULTY);
  }

  get canShowTimer(): boolean {
    return this.ignoreOptions ? true : this.optionsServ.getValueById(ToggleOption.SHOW_TIMER);
  }

  get canShowScore(): boolean {
    return this.ignoreOptions ? true : this.optionsServ.getValueById(ToggleOption.SHOW_SCORE);
  }

  get canShowMistakes(): boolean {
    return this.ignoreOptions ? true : this.optionsServ.getValueById(ToggleOption.SHOW_MISTAKES);
  }

  constructor(
    private readonly gameStateServ: GameStateService,
    private readonly timerServ: TimerService,
    private readonly mistakeServ: MistakeService,
    private readonly scoreServ: ScoreService,
    private readonly optionsServ: OptionsService
  ) {
    super();
  }
}
