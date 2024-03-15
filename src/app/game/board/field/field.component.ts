import {
  AfterViewInit,
  Component,
  ElementRef,
  HostBinding,
  HostListener,
  Input,
  OnChanges,
  OnDestroy,
  SimpleChanges,
} from '@angular/core';
import { Observable, Subject, combineLatest, tap } from 'rxjs';
import { GameStateService } from 'src/app/shared/services/game-state.service';
import { InputMode } from 'src/app/shared/services/game-state.types';
import { Field } from './field.types';
import { Animation, AnimationController } from '@ionic/angular';
import { Animated } from 'src/app/shared/interfaces/core.interface';

@Component({
  selector: 'app-field',
  templateUrl: './field.component.html',
  styleUrls: ['./field.component.scss'],
})
export class FieldComponent implements Animated, OnChanges, AfterViewInit, OnDestroy {
  @Input() field!: Field;
  @Input() border!: string[];
  inputMode$: Observable<InputMode> = this.gameStateServ.getInputMode$();
  private fieldAnimation!: Animation;

  /**
   * @TODO INTEGRATE WITH OPTIONS
   */
  animationsEnabled: boolean = true;

  private readonly viewReady$ = new Subject<void>();
  private readonly animate$ = new Subject<Field>();
  private readonly animateSub$ = combineLatest([this.animate$.asObservable(), this.viewReady$.asObservable()])
    .pipe(
      tap(([field]) => {
        if (field.value !== 0) {
          if (this.animationsEnabled) {
            this.fieldAnimation.play();
          }
        }
      })
    )
    .subscribe();

  @HostBinding('class.selected') get isSelected() {
    return this.field.selected;
  }

  @HostBinding('class.highlight') get isHighlight() {
    return this.field.selected ? false : this.field.highlight;
  }

  @HostBinding('class.border-left') get isBorderLeft() {
    return this.border.includes('left');
  }

  @HostBinding('class.border-top') get isBorderTop() {
    return this.border.includes('top');
  }

  @HostBinding('class.border-internal-top') get isBorderInternalTop() {
    return this.border.includes('internalTop');
  }

  @HostBinding('class.border-internal-left') get isBorderInternalLeft() {
    return this.border.includes('internalLeft');
  }

  @HostListener('click') onClick() {
    this.gameStateServ.onBoardFieldClick({
      ...this.field,
      ...{ selected: true },
    });
  }

  constructor(
    private gameStateServ: GameStateService,
    private animationCtrl: AnimationController,
    private ref: ElementRef
  ) {}

  ngAfterViewInit(): void {
    this.setAnimation();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if ('field' in changes) {
      const field = changes['field'].currentValue as Field;
      if (field.selected) {
        this.animate$.next(field);
      }
    }
  }

  ngOnDestroy(): void {
    this.animateSub$.unsubscribe();
  }

  setAnimation(): void {
    setTimeout(() => {
      const borderSize = Math.floor((this.ref.nativeElement as HTMLElement).clientWidth * 0.15);
      // prettier-ignore
      this.fieldAnimation = this.animationCtrl
      .create()
      .addElement(this.ref.nativeElement)
      .fill('none')
      .duration(550)
      .keyframes([
        { offset: 0.0, transform: 'scale(1.00)', 'box-sizing': 'border-box', border: `${borderSize}px solid ${this.field.isCorrectValue ? 'var(--ion-field-animate-border)' : 'var(--ion-field-animate-border-wrong)'} `},
        { offset: 0.1, transform: 'scale(1.10)', 'box-sizing': 'border-box', border: `${borderSize}px solid ${this.field.isCorrectValue ? 'var(--ion-field-animate-border)' : 'var(--ion-field-animate-border-wrong)'} `},
        { offset: 0.2, transform: 'scale(1.20)', 'box-sizing': 'border-box', border: `${borderSize}px solid ${this.field.isCorrectValue ? 'var(--ion-field-animate-border)' : 'var(--ion-field-animate-border-wrong)'} `},
        { offset: 0.3, transform: 'scale(1.30)', 'box-sizing': 'border-box', border: `${borderSize}px solid ${this.field.isCorrectValue ? 'var(--ion-field-animate-border)' : 'var(--ion-field-animate-border-wrong)'} `},
        { offset: 0.4, transform: 'scale(1.20)', 'box-sizing': 'border-box', border: `${borderSize}px solid ${this.field.isCorrectValue ? 'var(--ion-field-animate-border)' : 'var(--ion-field-animate-border-wrong)'} `},
        { offset: 0.5, transform: 'scale(1.10)', 'box-sizing': 'border-box', border: `${borderSize}px solid ${this.field.isCorrectValue ? 'var(--ion-field-animate-border)' : 'var(--ion-field-animate-border-wrong)'} `},
        { offset: 0.6, transform: 'scale(1.00)', 'box-sizing': 'border-box', border: `${borderSize}px solid ${this.field.isCorrectValue ? 'var(--ion-field-animate-border)' : 'var(--ion-field-animate-border-wrong)'} `},
        { offset: 0.7, transform: 'scale(1.10)', 'box-sizing': 'border-box', border: `${borderSize}px solid ${this.field.isCorrectValue ? 'var(--ion-field-animate-border)' : 'var(--ion-field-animate-border-wrong)'} `},
        { offset: 0.8, transform: 'scale(1.20)', 'box-sizing': 'border-box', border: `${borderSize}px solid ${this.field.isCorrectValue ? 'var(--ion-field-animate-border)' : 'var(--ion-field-animate-border-wrong)'} `},
        { offset: 0.9, transform: 'scale(1.30)', 'box-sizing': 'border-box', border: `${borderSize}px solid ${this.field.isCorrectValue ? 'var(--ion-field-animate-border)' : 'var(--ion-field-animate-border-wrong)'} `},
        { offset: 1.0, transform: 'scale(1.00)', 'box-sizing': 'border-box', border: `${borderSize}px solid ${this.field.isCorrectValue ? 'var(--ion-field-animate-border)' : 'var(--ion-field-animate-border-wrong)'} `},
      ]);
      this.viewReady$.next();
    }, 1000);
  }

  getFieldValueClass(field: Field) {
    return field.isInitialValue ? 'initial-value' : field.isCorrectValue ? 'player-value' : 'player-wrong-value';
  }
}
