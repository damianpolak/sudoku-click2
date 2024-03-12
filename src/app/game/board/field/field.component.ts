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
  ViewChild,
} from '@angular/core';
import { Observable, Subject, combineLatest, tap } from 'rxjs';
import { GameStateService } from 'src/app/shared/services/game-state.service';
import { InputMode } from 'src/app/shared/services/game-state.types';
import { Field } from './field.types';
import { Animation, AnimationController } from '@ionic/angular';

@Component({
  selector: 'app-field',
  templateUrl: './field.component.html',
  styleUrls: ['./field.component.scss'],
})
export class FieldComponent implements OnChanges, AfterViewInit, OnDestroy {
  @Input() field!: Field;
  @Input() border!: string[];
  inputMode$: Observable<InputMode> = this.gameStateServ.getInputMode$();

  @ViewChild('fieldWrapper', { static: true }) fieldWrapper!: ElementRef;
  private fieldAnimation!: Animation;

  /**
   * @TODO INTEGRATE WITH OPTIONS
   */
  private animationsEnabled: boolean = true;

  private readonly viewReady$ = new Subject<boolean>();
  private readonly animate$ = new Subject<Field>();
  private readonly animateSub$ = combineLatest([this.animate$.asObservable(), this.viewReady$.asObservable()])
    .pipe(
      tap(([field, ready]) => {
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

  constructor(private gameStateServ: GameStateService, private animationCtrl: AnimationController) {}

  ngAfterViewInit(): void {
    this.fieldAnimation = this.animationCtrl
      .create()
      .addElement(this.fieldWrapper.nativeElement)
      .fill('none')
      .duration(650)
      .keyframes([
        { offset: 0, 'box-sizing': 'border-box', transform: 'scale(1)' },
        { offset: 0.2, 'box-sizing': 'border-box', transform: 'scale(1.05)' },
        {
          offset: 0.4,
          'box-sizing': 'border-box',
          border: this.field.isCorrectValue
            ? '3px solid var(--ion-color-success)'
            : '3px solid var(--ion-color-danger)',
          transform: 'scale(1.08)',
          opacity: 0.6,
        },
        {
          offset: 0.6,
          'box-sizing': 'border-box',
          border: this.field.isCorrectValue
            ? '3px solid var(--ion-color-success-tint)'
            : '3px solid var(--ion-color-danger-tint)',
          transform: 'scale(1.11)',
          opacity: 0.7,
        },
        {
          offset: 0.8,
          'box-sizing': 'border-box',
          border: '3px solid var(--ion-field-selected)',
          transform: 'scale(1.15)',
          opacity: 0.8,
        },
        { offset: 1, 'box-sizing': 'border-box', transform: 'scale(1)' },
      ]);
    this.viewReady$.next(true);
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

  getFieldValueClass(field: Field) {
    return field.isInitialValue ? 'initial-value' : field.isCorrectValue ? 'player-value' : 'player-wrong-value';
  }
}
