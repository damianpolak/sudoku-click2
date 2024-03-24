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
import { InputModeType } from 'src/app/shared/services/game-state.types';
import { Field } from './field.types';
import { Animation } from '@ionic/angular';
import { Animated } from 'src/app/shared/interfaces/core.interface';
import { BaseComponent } from 'src/app/shared/abstracts/base-component.abstract';
import { FieldAnimation } from 'src/app/shared/animations/field.animation';

@Component({
  selector: 'app-field',
  templateUrl: './field.component.html',
  styleUrls: ['./field.component.scss'],
})
export class FieldComponent extends BaseComponent implements Animated, OnChanges, AfterViewInit, OnDestroy {
  @Input() field!: Field;
  @Input() border!: string[];
  inputMode$: Observable<InputModeType> = this.gameStateServ.getInputMode$();
  private fieldAnimation!: Animation;
  private readonly _debugMode: boolean = true;

  get debugMode(): boolean {
    return this._debugMode;
  }

  /**
   * @TODO INTEGRATE WITH OPTIONS
   */
  animationsEnabled: boolean = true;

  private readonly viewReady$ = new Subject<void>();
  private readonly animate$ = new Subject<Field>();
  private readonly animateSub$ = combineLatest([this.animate$.asObservable(), this.viewReady$.asObservable()])
    .pipe(
      tap(([field]) => {
        if (field.value !== 0 && field.isAnimated) {
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

  constructor(private gameStateServ: GameStateService, private ref: ElementRef) {
    super();
    this.registerSubscriptions([this.animateSub$]);
  }

  ngAfterViewInit(): void {
    this.viewReady$.next();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if ('field' in changes) {
      const field = changes['field'].currentValue as Field;
      this.setAnimation();
      if (field.selected) {
        this.animate$.next(field);
      }
    }
  }

  ngOnDestroy(): void {
    this.unsubscribeSubscriptions();
  }

  setAnimation(): void {
    const borderSize = Math.floor((this.ref.nativeElement as HTMLElement).clientWidth * 0.12);
    const isCorrectValue = this.field.isCorrectValue;
    this.fieldAnimation = new FieldAnimation(this.ref.nativeElement, {
      borderSize,
      isCorrectValue,
    }).getAnimation();
  }

  getFieldValueClass(field: Field) {
    return field.isInitialValue ? 'initial-value' : field.isCorrectValue ? 'player-value' : 'player-wrong-value';
  }
}
