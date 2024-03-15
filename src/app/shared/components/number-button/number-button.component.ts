import { AfterViewInit, Component, ElementRef, HostListener, Input, OnInit } from '@angular/core';
import { Animated } from '../../interfaces/core.interface';
import { Animation, AnimationController } from '@ionic/angular';

@Component({
  selector: 'app-number-button',
  templateUrl: './number-button.component.html',
  styleUrls: ['./number-button.component.scss'],
})
export class NumberButtonComponent implements Animated, OnInit, AfterViewInit {
  @Input() value: string = '';
  @Input() missingValue: string = '';
  private buttonAnimation!: Animation;
  animationsEnabled: boolean = true;

  @HostListener('click', ['$event'])
  mouseclick(event: PointerEvent) {
    if(this.animationsEnabled) {
      this.buttonAnimation.play();
    }
  }

  constructor(private ref: ElementRef, private animationCtrl: AnimationController) {}

  ngOnInit() {
    console.log();
  }

  ngAfterViewInit(): void {
    this.setAnimation();
  }

  setAnimation(): void {
    setTimeout(() => {
      // prettier-ignore
      this.buttonAnimation = this.animationCtrl
      .create()
      .addElement(this.ref.nativeElement)
      .fill('none')
      .duration(250)
      .easing('ease-out')
      .keyframes([
        { offset: 0.0, transform: 'scale(1.00)', 'z-index': '10'},
        { offset: 0.5, transform: 'scale(1.15)', 'z-index': '10'},
        { offset: 1.0, transform: 'scale(1.00)', 'z-index': '10'},
      ]);
    }, 500);
  }
}
