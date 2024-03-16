import {
  Component,
  Input,
  Output,
  ElementRef,
  AfterViewInit,
  OnChanges,
  SimpleChanges,
  HostBinding,
  EventEmitter,
} from '@angular/core';
import { Animation, AnimationController, AnimationFill } from '@ionic/angular';
import { Animated } from '../../interfaces/core.interface';
import { Banner } from './banner.types';

@Component({
  selector: 'app-banner',
  templateUrl: './banner.component.html',
  styleUrls: ['./banner.component.scss'],
})
export class BannerComponent implements Banner, Animated, OnChanges, AfterViewInit {
  @Input() show: boolean = false;
  @Input() title: string = '';
  @Input() message: string = '';
  @Input() durationTime: number = 1000;
  @Output() bannerCloseEvent: EventEmitter<void> = new EventEmitter<void>();

  @HostBinding('class.hide') get isHidden() {
    return !this.show;
  }

  private bannerAnimation!: Animation;
  animationsEnabled: boolean = true;

  constructor(private ref: ElementRef, private animationCtrl: AnimationController) {}

  async ngAfterViewInit(): Promise<void> {
    this.setAnimation();
  }

  async ngOnChanges(changes: SimpleChanges): Promise<void> {
    if ('show' in changes) {
      if (this.show) {
        await this.bannerAnimation.play();
        this.bannerAnimation.stop();
        this.bannerCloseEvent.emit();
      }
    }
  }

  setAnimation(): void {
    this.bannerAnimation = this.animationCtrl
      .create()
      .addElement(this.ref.nativeElement)
      .fill('none')
      .duration(this.durationTime)
      .fromTo('transform', 'scale(0)', 'scale(1)')
      .delay(1200)
      .keyframes([
        { offset: 0.0, opacity: '1.0' },
        { offset: 0.5, opacity: '0.5' },
        { offset: 1.0, opacity: '0.0' },
      ]);
  }
}
