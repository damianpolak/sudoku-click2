import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  HostBinding,
  HostListener,
  Input,
  OnChanges,
  OnInit,
  SimpleChanges,
} from '@angular/core';
import { Observable } from 'rxjs';
import { Notes, NotesBuilder } from 'src/app/shared/builders/notes.builder';
import { GameStateService } from 'src/app/shared/services/game-state.service';
import { InputMode } from 'src/app/shared/services/game-state.types';
import { Address, Field } from './field.types';
import { DomSanitizer, SafeStyle } from '@angular/platform-browser';

@Component({
  selector: 'app-field',
  templateUrl: './field.component.html',
  styleUrls: ['./field.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FieldComponent implements OnInit, OnChanges {
  @Input() field!: Field;
  @Input() border!: string[];
  inputMode$: Observable<InputMode> = this.gameStateServ.getInputMode$();

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

  // @HostBinding('style') animateStyle!: SafeStyle;

  constructor(private gameStateServ: GameStateService, private sanitizer: DomSanitizer, private ref: ChangeDetectorRef) {}
  ngOnChanges(changes: SimpleChanges): void {
    {}
    // if (this.field.selected) {
    //   console.log('Selected is', this.field.address);
    //   this.animateStyle = this.sanitizer.bypassSecurityTrustStyle(
    //     'transform: scale(1.2); z-index: 10;'
    //   );

    //   setTimeout(() => {
    //     this.animateStyle = this.sanitizer.bypassSecurityTrustStyle(
    //       'transform: scale(1);'
    //     );
    //   }, 200);
    // }
    // throw new Error('Method not implemented.');
  }

  public getStyles(selected: boolean): Record<string, string> {
    console.log('gg');
    return selected ? {
      'transform': 'scale(1.3)',
      'background-color': 'inherit',
      'z-index': '10',
      // 'border': '2px solid black',
      'box-sizing': 'border-box'
    } : {
      // 'transform': 'scale(1)',
      // 'background-color': 'inherit'
    }
    // return {
    //   display: 'grid',
    //   'grid-template-rows': `repeat(${this.rows}, ${this.squareSizeRem})`,
    //   'grid-template-columns': `repeat(${this.rows}, ${this.squareSizeRem})`,
    // };
  }

  ngOnInit() {
    {
    }
  }
}
