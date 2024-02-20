import { Component, HostBinding, HostListener, Input, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { Notes, NotesBuilder } from 'src/app/shared/builders/notes.builder';
import { GameStateService } from 'src/app/shared/services/game-state.service';
import { InputMode } from 'src/app/shared/services/game-state.types';
import { Address, Field } from './field.types';

@Component({
  selector: 'app-field',
  templateUrl: './field.component.html',
  styleUrls: ['./field.component.scss'],
})
export class FieldComponent implements OnInit {
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

  constructor(private gameStateServ: GameStateService) {}

  ngOnInit() {
    {
    }
  }
}
