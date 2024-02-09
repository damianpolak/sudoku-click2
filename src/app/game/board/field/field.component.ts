import { Component, Input, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { GridBuilder } from 'src/app/shared/builders/grid.builder';
import { Notes, NotesBuilder } from 'src/app/shared/builders/notes.builder';
import { GameStateService } from 'src/app/shared/services/game-state.service';
import { InputMode } from 'src/app/shared/services/game-state.types';

@Component({
  selector: 'app-field',
  templateUrl: './field.component.html',
  styleUrls: ['./field.component.scss'],
})
export class FieldComponent implements OnInit {
  @Input() value: unknown;
  inputMode$: Observable<InputMode> = this.gameStateServ.getInputMode$();
  isSelected: boolean = false;
  notes: NotesBuilder = new NotesBuilder();

  constructor(private gameStateServ: GameStateService) {}

  ngOnInit() {
    {
    }
  }
}
