import { AfterViewInit, Component, EventEmitter, Input, OnDestroy, Output, ViewChild } from '@angular/core';
import { IonModal } from '@ionic/angular';
import { Subscription } from 'rxjs';

interface Modal extends AfterViewInit, OnDestroy {
  isOpen: boolean;
  actionEvent: EventEmitter<any>;
  modalViewChild: IonModal;
  modalWillDismissSub$: Subscription;
  modalDidPresentSub$: Subscription;
  backdropDismissEnabled: boolean;
  ngAfterViewInit(): void;
  ngOnDestroy(): void;
  action(action: unknown): Promise<void>;
}

@Component({ template: '' })
export abstract class DynamicModalComponent<T> implements Modal, AfterViewInit, OnDestroy {
  @Input() isOpen: boolean = false;
  @Output() actionEvent = new EventEmitter<T>();
  @ViewChild('modal') modalViewChild!: IonModal;
  modalWillDismissSub$!: Subscription;
  modalDidPresentSub$!: Subscription;
  backdropDismissEnabled: boolean = false;

  ngAfterViewInit(): void {
    this.modalWillDismissSub$ = this.modalViewChild.willDismiss.subscribe((result) => {
      this.isOpen = false;
      this.actionEvent.emit(typeof result.detail.data === 'undefined' ? 'DISMISS' : result.detail.data);
    });

    this.modalDidPresentSub$ = this.modalViewChild.didPresent.subscribe(() => {
      this.isOpen = true;
    });
  }

  ngOnDestroy(): void {
    this.modalWillDismissSub$.unsubscribe();
    this.modalDidPresentSub$.unsubscribe();
  }

  async action(action: T): Promise<void> {
    await this.modalViewChild.dismiss(action);
  }
}
