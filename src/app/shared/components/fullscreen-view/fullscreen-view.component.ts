import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  EventEmitter,
  HostBinding,
  Input,
  OnChanges,
  OnDestroy,
  OnInit,
  Output,
  SimpleChanges,
} from '@angular/core';
import { Animation, AnimationController, ModalController } from '@ionic/angular';
import { FinishGameType } from './fullscreen-view.types';
import { Animated } from '../../interfaces/core.interface';

@Component({
  selector: 'app-fullscreen-view',
  templateUrl: './fullscreen-view.component.html',
  styleUrls: ['./fullscreen-view.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FullscreenViewComponent implements Animated, OnInit, OnDestroy, OnChanges {
  @Input() isOpen: boolean = true;
  @Input() title: string = '';
  @Input() description: string = '';
  @Input() durationTime: number = 1000;
  @Input() finishType: FinishGameType | undefined;
  @Output() closeEvent: EventEmitter<void> = new EventEmitter<void>();

  @HostBinding('class.hide') get isHidden() {
    return !this.isOpen;
  }
  constructor(private animationCtrl: AnimationController, private ref: ElementRef) {}
  ngOnDestroy(): void {
    console.log('=== fullscreen view destroy');
  }
  ngOnInit(): void {
    console.log('=== fullscreen view init');
  }
  animationsEnabled: boolean = true;
  private bannerAnimation!: Animation;

  async ngOnChanges(changes: SimpleChanges): Promise<void> {
    this.setAnimation();
    if ('isOpen' in changes) {
      if (this.isOpen) {
        console.log('isOpen is', this.isOpen);
        await this.bannerAnimation.play();
        this.bannerAnimation.stop();
        console.log('end of animation');
      }
    }
  }

  getFinishGameClassType() {
    switch (this.finishType) {
      case FinishGameType.VICTORY:
        return 'victory-background';
      case FinishGameType.LOSS:
        return 'loss-background';
      default:
        return 'default-background';
    }
  }

  onClose(): void {
    this.isOpen = false;
    this.closeEvent.emit();
  }

  setAnimation(): void {
    this.bannerAnimation = this.animationCtrl
      .create()
      .addElement(this.ref.nativeElement)
      .fill('none')
      .duration(this.durationTime)
      .fromTo('transform', 'scale(0)', 'scale(1)')
      .beforeAddClass(this.getFinishGameClassType())
      .keyframes([
        { offset: 0.0, opacity: '0.0' },
        { offset: 0.5, opacity: '0.5' },
        { offset: 1.0, opacity: '1.0' },
      ]);
  }
}
