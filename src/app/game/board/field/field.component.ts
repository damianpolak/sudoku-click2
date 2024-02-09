import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
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
export class FieldComponent implements OnInit, OnChanges {
  @Input() value!: number;
  @Input() address!: Address;
  @Input() highlight = false;
  @Input() selected = false;
  @Input() notes!: Notes;
  inputMode$: Observable<InputMode> = this.gameStateServ.getInputMode$();

  constructor(private gameStateServ: GameStateService) {}

  ngOnChanges(changes: SimpleChanges): void {
    {
    }
    // console.log(changes);
  }

  ngOnInit() {
    {
    }
  }
}
