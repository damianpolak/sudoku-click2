import { Component, Input, OnInit } from '@angular/core';
import { GridBuilder } from 'src/app/shared/builders/grid.builder';
import { GameStateService } from 'src/app/shared/services/game-state.service';

@Component({
  selector: 'app-field',
  templateUrl: './field.component.html',
  styleUrls: ['./field.component.scss'],
})
export class FieldComponent implements OnInit {
  @Input() value: unknown;
  fieldMode = this.gameStateServ.getFieldMode$();
  notesGridSquareRoot: number = 3;
  notesGrid!: number[];

  constructor(private gameStateServ: GameStateService) {
  }

  ngOnInit() {
    this.notesGrid = new GridBuilder(this.notesGridSquareRoot, this.notesGridSquareRoot, 0).getGrid().flat();
    this.notesGrid = this.notesGrid.map((_, index) => ++index);

    this.setNotesValues([5,2,1,2]);
  }

  setNotesValues(values: number[], overwrite: boolean = true): void {
    if(!values.every(x => x >= 1 && x <= 9)) {
      throw new TypeError('The numbers must be in the range 1 to 9');
    }

    values = Array.from(new Set(values.sort()));
    this.notesGrid.forEach((i, index) => {
      this.notesGrid[index] = values.includes(i) ? i : (overwrite ? i : 0);
    });

    console.log(Array.from(new Set(values.sort())));
  }
}
