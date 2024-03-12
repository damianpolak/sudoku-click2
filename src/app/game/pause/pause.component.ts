import { AfterViewInit, Component, EventEmitter, Input, OnDestroy, OnInit, Output, ViewChild } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { IonModal } from '@ionic/angular/common';
import { PauseModalActionType } from './pause.types';
import { GameStateService } from 'src/app/shared/services/game-state.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-pause',
  templateUrl: './pause.component.html',
  styleUrls: ['./pause.component.scss'],
})
export class PauseComponent implements AfterViewInit, OnDestroy {
  @Input() isOpen: boolean = false;
  @Output() actionEvent = new EventEmitter<PauseModalActionType>();
  @ViewChild('pauseModal') pauseModal!: IonModal;

  private pauseModalWillDismissSub$!: Subscription;
  private pasueModalDidPresentSub$!: Subscription;

  buttonsSize: 'small' | 'default' | 'large' = 'default';

  /**
   * @TODO INTEGRATE WITH OPTIONS
   */
  backdropDismissEnabled: boolean = false;

  constructor(private gameStateServ: GameStateService) {}

  ngAfterViewInit(): void {
    this.pauseModalWillDismissSub$ = this.pauseModal.willDismiss.subscribe((result) => {
      this.isOpen = false;
      this.actionEvent.emit(typeof result.detail.data === 'undefined' ? 'DISMISS' : result.detail.data);
    });

    this.pasueModalDidPresentSub$ = this.pauseModal.didPresent.subscribe(() => {
      this.isOpen = true;
    });
  }

  ngOnDestroy(): void {
    this.pauseModalWillDismissSub$.unsubscribe();
    this.pasueModalDidPresentSub$.unsubscribe();
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
