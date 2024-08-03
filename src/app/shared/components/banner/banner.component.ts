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
import { Animation } from '@ionic/angular';
import { Animated } from '../../interfaces/core.interface';
import { Banner } from './banner.types';
import { BannerAnimation } from '../../animations/banner.animation';

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

  private animation!: Animation;
  animationsEnabled: boolean = true;

  constructor(private readonly ref: ElementRef) {}

  async ngAfterViewInit(): Promise<void> {
    this.setAnimation();
  }

  async ngOnChanges(changes: SimpleChanges): Promise<void> {
    if ('show' in changes) {
      if (this.show) {
        await this.animation.play();
        this.animation.stop();
        this.bannerCloseEvent.emit();
      }
    }
  }

  setAnimation(): void {
    this.animation = new BannerAnimation(this.ref.nativeElement, { duration: this.durationTime }).getAnimation();
  }
}
