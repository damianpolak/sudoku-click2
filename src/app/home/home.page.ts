import { Component } from '@angular/core';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage {
  squareRoot: number = 9;
  notesGridSquareRoot: number = 3;
  isValueMode: boolean = false;

  board: number[][] = [];
  notesGrid: number[][] = []
  constructor() {
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

    this.setBoardSize(this.squareRoot);
  }

  setBoardSize(size: number): void {
    document.documentElement.style.setProperty('--boardSize', size.toString());
  }

  toggleMode(): void {
    this.isValueMode = !this.isValueMode;
    console.log(`Mode is ${this.isValueMode}`);
  }
}
