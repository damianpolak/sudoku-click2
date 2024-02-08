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
  // notesGrid: number[][] = [];
  notesGrid!: number[];

  constructor(private gameStateServ: GameStateService) {


  }

  ngOnInit() {
    this.notesGrid = new GridBuilder(this.notesGridSquareRoot, this.notesGridSquareRoot, 0).getGrid().flat();
    this.notesGrid = this.notesGrid.map((_, index) => ++index);
    this.notesGrid[4] = 0;
    console.log(this.notesGrid);
    // console.log(this.notesGrid);

    // for (let row = 0; row < this.notesGridSquareRoot; row++) {
    //   this.notesGrid.push([]);
    //   for (let col = 0; col < this.notesGridSquareRoot; col++) {
    //     this.notesGrid[row][col] = count;
    //     count++;
    //   }
    // }
  }
}
