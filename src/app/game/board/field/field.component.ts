import { Component, EventEmitter, HostBinding, HostListener, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
import { Observable } from 'rxjs';
import { GridBuilder } from 'src/app/shared/builders/grid.builder';
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
  @Input() value!: number;
  @Input() address!: Address;
  @Input() highlight = false;
  @Input() selected: boolean = false;
  @Input() notes!: Notes;
  inputMode$: Observable<InputMode> = this.gameStateServ.getInputMode$();

  @HostBinding('class.selected') get isSelected() {
    return this.selected;
  }

  @HostBinding('class.highlight') get isHighlight() {
    return this.selected ? false : this.highlight;
  }

  @HostListener('click') onClick() {
    this.gameStateServ.updateFieldBoard({
      value: this.value,
      address: this.address,
      highlight: this.highlight,
      selected: true,
      notes: this.notes
    })
  }

  constructor(private gameStateServ: GameStateService) {}

  ngOnInit() {
    {}
  }


}
