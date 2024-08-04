import { Component } from '@angular/core';
import { PauseModalActionType } from './pause.types';
import { DynamicModalComponent } from 'src/app/shared/abstracts/modal.abstract';
import { Observable, of } from 'rxjs';
import { ScoreService } from 'src/app/shared/services/score.service';
import { AppStateService } from 'src/app/shared/services/app-state.service';
import { OptionsService } from 'src/app/options/options.service';
import { ToggleOption } from 'src/app/options/options.types';

@Component({
  selector: 'app-pause',
  templateUrl: './pause.component.html',
  styleUrls: ['./pause.component.scss'],
})
export class PauseComponent extends DynamicModalComponent<PauseModalActionType> {
  buttonsSize: 'small' | 'default' | 'large' = 'default';
  score: Observable<number> = this.scoreServ.getPresentScore();

  get pauseBackdropDismissOption(): Observable<boolean> {
    return of(this.optionsService.getValueById(ToggleOption.CLICK_BACKDROP_TO_UNPAUSE));
  }

  constructor(
    private readonly scoreServ: ScoreService,
    private readonly appStateServ: AppStateService,
    private readonly optionsService: OptionsService
  ) {
    super();
  }

  async onContinueClick(): Promise<void> {
    this.appStateServ.onOptionButtonClick();
    await this.action('CONTINUE');
  }

  async onRestartClick(): Promise<void> {
    this.appStateServ.onOptionButtonClick();
    await this.action('RESTART');
  }
}
