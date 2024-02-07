import { Component, Input, OnInit } from '@angular/core';
import { GameLevel, GameStateService } from 'src/app/shared/services/game-state.service';

@Component({
  selector: 'app-board',
  templateUrl: './board.component.html',
  styleUrls: ['./board.component.scss'],
})
export class BoardComponent implements OnInit {
  squareRoot!: number;
  notesGridSquareRoot: number = 3;
  @Input() mode: boolean = false;

  level!: GameLevel;
  board: number[][] = [];
  notesGrid: number[][] = [];
  constructor(private gameStateServ: GameStateService) {}

  ngOnInit() {
    this.loadLevelProperties();

    for (let row = 0; row < this.squareRoot; row++) {
      this.board.push([]);
      for (let col = 0; col < this.squareRoot; col++) {
        this.board[row][col] = Math.round(Math.random() * 9);
      }
    }

    let count = 1;
    for (let row = 0; row < this.notesGridSquareRoot; row++) {
      this.notesGrid.push([]);
      for (let col = 0; col < this.notesGridSquareRoot; col++) {
        this.notesGrid[row][col] = count;
        count++;
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
