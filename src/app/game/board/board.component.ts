import { Component, Input, OnInit } from '@angular/core';
import { GridBuilder } from 'src/app/shared/builders/grid.builder';
import { NotesBuilder } from 'src/app/shared/builders/notes.builder';
import { GameLevel, GameStateService } from 'src/app/shared/services/game-state.service';
import { Field } from './field/field.types';

@Component({
  selector: 'app-board',
  templateUrl: './board.component.html',
  styleUrls: ['./board.component.scss'],
})
export class BoardComponent implements OnInit {
  squareRoot!: number;
  @Input() mode: boolean = false;

  level!: GameLevel;
  board: number[][] = [];
  constructor(private gameStateServ: GameStateService) {}

  ngOnInit() {
    const testGrid = new GridBuilder(3, 3, {
      value: 0,
      notes: new NotesBuilder().get(),
      address: { row: 0, col: 0 },
      selected: false,
      crossed: false,
    } as Field).getGrid();

    console.log(testGrid)

    this.loadLevelProperties();

    for (let row = 0; row < this.squareRoot; row++) {
      this.board.push([]);
      for (let col = 0; col < this.squareRoot; col++) {
        this.board[row][col] = Math.round(Math.random() * 2) === 2 ? 0 : Math.floor(Math.random() * 9) + 1;
      }
    }
  }

  loadLevelProperties(): void {
    this.level = this.gameStateServ.selectedLevel;
    this.squareRoot = this.level.cols;
    this.setBoardSize(this.squareRoot);
  }

  setBoardSize(size: number): void {
    document.documentElement.style.setProperty('--board-size', size.toString());
  }
}
