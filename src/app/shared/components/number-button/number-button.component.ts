import {
  AfterViewInit,
  Component,
  ElementRef,
  HostBinding,
  HostListener,
  Input,
  OnDestroy,
  OnInit,
} from '@angular/core';
import { Animated } from '../../interfaces/core.interface';
import { Animation, AnimationController } from '@ionic/angular';
import { GameStateService } from '../../services/game-state.service';
import { InputMode } from '../../services/game-state.types';
import { Subscription, tap } from 'rxjs';
import { BaseComponent } from '../../abstracts/base-component.abstract';

@Component({
  selector: 'app-number-button',
  templateUrl: './number-button.component.html',
  styleUrls: ['./number-button.component.scss'],
})
export class NumberButtonComponent extends BaseComponent implements Animated, OnDestroy, AfterViewInit {
  private readonly inputModeSub$: Subscription = this.gameStateServ
    .getInputMode$()
    .pipe(
      tap((_) => {
        this.background = _ === 'notes' ? 'transparent' : '';
      })
    )
    .subscribe((v) => (this._inputMode = v));
  @Input() value: string = '';
  @Input() missingValue: string = '';
  private buttonAnimation!: Animation;
  private _inputMode!: InputMode;
  animationsEnabled: boolean = true;

  get inputMode(): InputMode {
    return this._inputMode;
  }

  @HostBinding('style.background') background!: string;
  @HostListener('click', ['$event'])
  mouseclick(event: PointerEvent) {
    if (this.animationsEnabled) {
      this.buttonAnimation.play();
    }
  }

  constructor(
    private ref: ElementRef,
    private animationCtrl: AnimationController,
    private gameStateServ: GameStateService
  ) {
    super();
    this.registerSubscriptions([this.inputModeSub$]);
  }

  ngOnDestroy(): void {
    this.unsubscribeSubscriptions();
  }

  ngAfterViewInit(): void {
    this.setAnimation();
  }

  setAnimation(): void {
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
  }
}
