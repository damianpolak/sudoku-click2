import { AfterViewInit, Component, OnDestroy, OnInit } from '@angular/core';
import { ResizeObservableService } from '../shared/services/resize-observable.service';
import { AppStateService } from '../shared/services/app-state.service';
import { Observable, lastValueFrom } from 'rxjs';
import { GameLevel, GameStateService } from '../shared/services/game-state.service';

@Component({
  selector: 'app-game',
  templateUrl: './game.page.html',
  styleUrls: ['./game.page.scss'],
  providers: [ResizeObservableService],
})
export class GamePage implements OnInit, OnDestroy {
  orientation = this.appStateServ.getScreenOrientation$();

  squareRoot!: number;
  notesGridSquareRoot: number = 3;
  isValueMode: boolean = false;

  level!: GameLevel;
  board: number[][] = [];
  notesGrid: number[][] = [];
  constructor(
    private resizeServ: ResizeObservableService,
    private appStateServ: AppStateService,
    private gameStateServ: GameStateService
  ) {}

  ngOnInit(): void {
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

  ngOnDestroy(): void {
    console.log();
  }

  loadLevelProperties(): void {
    this.level = this.gameStateServ.selectedLevel;
    this.squareRoot = this.level.cols;
    this.setBoardSize(this.squareRoot);
  }

  setBoardSize(size: number): void {
    document.documentElement.style.setProperty('--board-size', size.toString());
  }

  toggleMode(): void {
    this.isValueMode = !this.isValueMode;
    console.log(`Mode is ${this.isValueMode}`);
  }
}
