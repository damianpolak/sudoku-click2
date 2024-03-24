import { AfterViewInit, Component, ElementRef, OnDestroy, OnInit } from '@angular/core';
import { GameLevel, GameStateService } from 'src/app/shared/services/game-state.service';
import { Address, Field } from './field/field.types';
import { Board } from './board.types';
import { SudokuUtil } from 'src/app/shared/utils/sudoku.util';
import { Subscription, tap } from 'rxjs';
import { BoardService } from './board.service';
import { Animation } from '@ionic/angular';
import { Animated } from 'src/app/shared/interfaces/core.interface';
import { GameStartMode, GameStartType } from 'src/app/shared/services/game-state.types';
import { Banner } from 'src/app/shared/components/banner/banner.types';
import { BaseComponent } from 'src/app/shared/abstracts/base-component.abstract';
import { BoardStartAnimation } from 'src/app/shared/animations/board-start.animation';
import { BoardRestartAnimation } from 'src/app/shared/animations/board-restart.animation';
import { BoardSecondChanceAnimation } from 'src/app/shared/animations/board-second-chance.animation';

@Component({
  selector: 'app-board',
  templateUrl: './board.component.html',
  styleUrls: ['./board.component.scss'],
  providers: [BoardService],
})
export class BoardComponent extends BaseComponent implements Animated, OnInit, OnDestroy, AfterViewInit {
  private _board: Board = [];
  private level!: GameLevel;
  private borderSquares: Array<Record<string, string>> = [];
  private startAnimation!: Animation;
  private restartAnimation!: Animation;
  private secondChanceAnimation!: Animation;

  messageBanner: Banner = {
    show: false,
    title: '',
    message: '',
  };

  animationsEnabled: boolean = true;

  private boardSub$: Subscription = this.boardServ.getBoard$().subscribe((board) => (this._board = board));
  private readonly gameStartModeSub$: Subscription = this.gameStateServ
    .getGameStartMode$()
    .pipe(
      tap((gameStartMode) => {
        this.animationHandler(gameStartMode);
      })
    )
    .subscribe();

  get board() {
    return this._board;
  }

  constructor(private gameStateServ: GameStateService, private boardServ: BoardService, private ref: ElementRef) {
    super();
    this.registerSubscriptions([this.boardSub$, this.gameStartModeSub$]);
  }

  ngOnInit() {
    this.loadLevelProperties();
    this.borderSquares = this.countBorderSquares(this.board);
    this.boardServ.setDefaultSelectedField();
  }

  ngOnDestroy(): void {
    this.unsubscribeSubscriptions();
  }

  ngAfterViewInit(): void {
    this.setAnimation();
  }

  private countBorderSquares(board: Board): Array<Record<string, string>> {
    const obj: Array<Record<string, string>> = [];
    const squares = SudokuUtil.getBoardSquares(SudokuUtil.toNumericBoard(board, 'value'));
    const sqrt = Math.sqrt(squares.length);

    squares.forEach((row, rowIndex) => {
      row.forEach((col, colIndex) => {
        if (colIndex !== 0 && colIndex % sqrt === 0) {
          obj.push({ left: `${rowIndex},${colIndex}` });
        }

        if (rowIndex !== 0 && rowIndex % sqrt === 0) {
          obj.push({ top: `${rowIndex},${colIndex}` });
        }

        if (rowIndex % sqrt !== 0) {
          obj.push({ internalTop: `${rowIndex},${colIndex}` });
        }

        if (colIndex % sqrt !== 0) {
          obj.push({ internalLeft: `${rowIndex},${colIndex}` });
        }
      });
    });

    return obj;
  }

  getBorderSquareForAddr(address: Address): string[] {
    return this.borderSquares
      .filter((f) => Object.values(f).includes(`${address.row},${address.col}`))
      .map((i) => Object.keys(i).toString());
  }

  trackFieldByAddress(index: number, item: Field): string {
    return `${item.address.row}${item.address.col}`;
  }

  private loadLevelProperties(): void {
    this.level = this.gameStateServ.selectedLevel;
    this.setBoardSize(this.level.cols);
  }

  private setBoardSize(size: number): void {
    document.documentElement.style.setProperty('--board-size', size.toString());
  }

  private async animationHandler(gameStartMode: GameStartMode): Promise<void> {
    setTimeout(async () => {
      if (this.animationsEnabled) {
        switch (gameStartMode.type) {
          case GameStartType.RESTART_GAME:
            this.showAnimation(this.restartAnimation, 'Restart game', 'Good luck!');
            break;
          case GameStartType.SECOND_CHANCE:
            this.showAnimation(this.secondChanceAnimation, 'Second chance', 'Good luck!');
            break;
          default:
            this.showAnimation(
              this.startAnimation,
              `${gameStartMode.type === GameStartType.NEW_GAME ? 'New game' : 'Continue'}`,
              'Good luck!'
            );
        }
      }
    }, 100);
  }

  private async showAnimation(animation: Animation, title: string, message: string): Promise<void> {
    await animation.play();
    this.showBanner(title, message);
  }

  setAnimation(): void {
    this.startAnimation = new BoardStartAnimation(this.ref.nativeElement).getAnimation();
    this.restartAnimation = new BoardRestartAnimation(this.ref.nativeElement).getAnimation();
    this.secondChanceAnimation = new BoardSecondChanceAnimation(this.ref.nativeElement).getAnimation();
  }

  showBanner(title: string, message: string): void {
    this.messageBanner = {
      show: true,
      title: title,
      message: message,
    };
  }

  onBannerClose(): void {
    this.messageBanner = {
      ...this.messageBanner,
      ...{ show: false },
    };
  }
}
