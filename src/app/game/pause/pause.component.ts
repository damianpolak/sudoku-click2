import {
  AfterViewInit,
  Component,
  EventEmitter,
  Input,
  OnInit,
  Output,
  ViewChild,
} from '@angular/core';
import { ModalController } from '@ionic/angular';
import { IonModal } from '@ionic/angular/common';
import { PauseModalActionType } from './pause.types';

@Component({
  selector: 'app-pause',
  templateUrl: './pause.component.html',
  styleUrls: ['./pause.component.scss'],
})
export class PauseComponent implements AfterViewInit {
  @Input() isOpen: boolean = false;
  @Output() actionEvent = new EventEmitter<PauseModalActionType>();
  @ViewChild('pauseModal') pauseModal!: IonModal;

  buttonsSize: 'small' | 'default' | 'large' = 'small';
  // constructor() {}

  ngAfterViewInit(): void {
    this.pauseModal.willDismiss.subscribe((result) => {
      this.isOpen = false;
      this.actionEvent.emit(
        typeof result.detail.data === 'undefined'
          ? 'DISMISS'
          : result.detail.data
      );
      // console.log(`=== window is dismissed!`, result);
    });

    this.pauseModal.didPresent.subscribe(() => {
      this.isOpen = true;
      console.log(`=== windows is opened`);
    });
  }

  async action(action: PauseModalActionType): Promise<void> {
    await this.pauseModal.dismiss(action);
  }

  async onContinueClick(): Promise<void> {
    await this.action('CONTINUE');
  }

  async onRestartClick(): Promise<void> {
    await this.action('RESTART');
  }

  async onCancelClick(): Promise<void> {
    await this.action('CANCELGAME');
  }
}
