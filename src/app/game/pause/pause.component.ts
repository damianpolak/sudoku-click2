import { Component } from '@angular/core';
import { PauseModalActionType } from './pause.types';
import { DynamicModalComponent } from 'src/app/shared/abstracts/modal.abstract';

@Component({
  selector: 'app-pause',
  templateUrl: './pause.component.html',
  styleUrls: ['./pause.component.scss'],
})
export class PauseComponent extends DynamicModalComponent<PauseModalActionType> {
  buttonsSize: 'small' | 'default' | 'large' = 'default';

  constructor() {
    super();
  }

  async onContinueClick(): Promise<void> {
    await this.action('CONTINUE');
  }

  async onRestartClick(): Promise<void> {
    await this.action('RESTART');
  }
}
