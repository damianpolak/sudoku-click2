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
import { Animation } from '@ionic/angular';
import { GameStateService } from '../../services/game-state.service';
import { BurstModeType, InputModeType } from '../../services/game-state.types';
import { Subscription, combineLatest, tap } from 'rxjs';
import { BaseComponent } from '../../abstracts/base-component.abstract';
import { NumberButtonAnimation } from '../../animations/number-button.animation';

type InterractionPayload = {
  inputMode: InputModeType;
  burstMode: BurstModeType;
  selectedNumber: number | undefined;
};

@Component({
  selector: 'app-number-button',
  templateUrl: './number-button.component.html',
  styleUrls: ['./number-button.component.scss'],
})
export class NumberButtonComponent extends BaseComponent implements Animated, OnDestroy, AfterViewInit {
  private readonly interractionSub$: Subscription = combineLatest([
    this.gameStateServ.getInputMode$(),
    this.gameStateServ.getBurstMode$(),
    this.gameStateServ.getSelectedBurstNumber$(),
  ])
    .pipe(
      tap(([inputMode, burstMode, selectedNumber]) => {
        this.interractionHandler({ inputMode, burstMode, selectedNumber });
      })
    )
    .subscribe(([v]) => (this._inputMode = v));

  @Input() value: string = '';
  @Input() missingValue: string = '';
  private buttonAnimation!: Animation;
  private _inputMode!: InputModeType;
  animationsEnabled: boolean = true;

  get inputMode(): InputModeType {
    return this._inputMode;
  }

  @HostBinding('style.background') background!: string;
  @HostBinding('style.opacity') opacity!: number;

  @HostListener('click', ['$event'])
  mouseclick(event: PointerEvent) {
    if (this.animationsEnabled) {
      this.buttonAnimation.play();
    }
  }

  constructor(private ref: ElementRef, private gameStateServ: GameStateService) {
    super();
    this.registerSubscriptions([this.interractionSub$]);
  }

  ngOnDestroy(): void {
    this.unsubscribeSubscriptions();
  }

  ngAfterViewInit(): void {
    this.setAnimation();
  }

  setAnimation(): void {
    this.buttonAnimation = new NumberButtonAnimation(this.ref.nativeElement).getAnimation();
  }

  interractionHandler(interraction: InterractionPayload): void {
    this.background = interraction.inputMode === InputModeType.NOTES ? 'transparent' : '';
    switch (interraction.burstMode) {
      case BurstModeType.NORMAL:
        this.opacity = 1;
        break;
      case BurstModeType.BURST:
        if (interraction.selectedNumber) {
          this.opacity = interraction.selectedNumber.toString() === this.value ? 1 : 0.3;
        } else {
          this.opacity = 0.3;
        }
        break;
    }
  }
}
