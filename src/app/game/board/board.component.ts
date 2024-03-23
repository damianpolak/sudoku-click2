import { AfterViewInit, Component, ElementRef, OnDestroy, OnInit, Renderer2 } from '@angular/core';
import { GameLevel, GameStateService } from 'src/app/shared/services/game-state.service';
import { Address, Field } from './field/field.types';
import { Board } from './board.types';
import { SudokuUtil } from 'src/app/shared/utils/sudoku.util';
import { Subscription, tap } from 'rxjs';
import { BoardService } from './board.service';
import { Animation, AnimationController } from '@ionic/angular';
import { Animated } from 'src/app/shared/interfaces/core.interface';
import { GameStartMode, GameStartType } from 'src/app/shared/services/game-state.types';
import { Banner } from 'src/app/shared/components/banner/banner.types';
import { BaseClass } from 'src/app/shared/abstracts/base-class.abstract';
import { BaseComponent } from 'src/app/shared/abstracts/base-component.abstract';

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

  constructor(
    private gameStateServ: GameStateService,
    private boardServ: BoardService,
    private animationCtrl: AnimationController,
    private renderer2: Renderer2,
    private ref: ElementRef
  ) {
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
            console.log("I've got second chance");
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
    // prettier-ignore
    this.startAnimation = this.animationCtrl
      .create()
      .addElement(this.ref.nativeElement)
      .fill('none')
      .delay(200)
      .duration(350)
      .afterStyles({'transform': 'scale(1)'})
      .keyframes([
        { offset: 0.0, transform: 'scale(0.0) rotate(0.0turn)', filter: 'blur(0px)' },
        { offset: 0.1, transform: 'scale(0.1) rotate(0.1turn)', filter: 'blur(1.5px)' },
        { offset: 0.2, transform: 'scale(0.2) rotate(0.2turn)', filter: 'blur(2.5px)' },
        { offset: 0.3, transform: 'scale(0.3) rotate(0.3turn)', filter: 'blur(3.5px)' },
        { offset: 0.4, transform: 'scale(0.4) rotate(0.4turn)', filter: 'blur(4.5px)' },
        { offset: 0.5, transform: 'scale(0.5) rotate(0.5turn)', filter: 'blur(5px)' },
        { offset: 0.6, transform: 'scale(0.6) rotate(0.6turn)', filter: 'blur(4.5px)' },
        { offset: 0.7, transform: 'scale(0.7) rotate(0.7turn)', filter: 'blur(3.5px)' },
        { offset: 0.8, transform: 'scale(0.8) rotate(0.8turn)', filter: 'blur(2.5px)' },
        { offset: 0.9, transform: 'scale(0.9) rotate(0.9turn)', filter: 'blur(1.5px)' },
        { offset: 1.0, transform: 'scale(1.0) rotate(1.0turn)', filter: 'blur(0px)' },
      ]);

    // prettier-ignore
    this.restartAnimation = this.animationCtrl
      .create()
      .addElement(this.ref.nativeElement)
      .fill('none')
      .duration(350)
      .keyframes([
        { offset: 0.0, transform: 'rotate(0.0turn) scale(1.0)', filter: 'blur(0px)' },
        { offset: 0.1, transform: 'rotate(0.1turn) scale(0.9)', filter: 'blur(1.5px)' },
        { offset: 0.2, transform: 'rotate(0.2turn) scale(0.8)', filter: 'blur(2.5px)' },
        { offset: 0.3, transform: 'rotate(0.3turn) scale(0.7)', filter: 'blur(3.5px)' },
        { offset: 0.4, transform: 'rotate(0.4turn) scale(0.6)', filter: 'blur(4.5px)' },
        { offset: 0.5, transform: 'rotate(0.5turn) scale(0.5)', filter: 'blur(5px)' },
        { offset: 0.6, transform: 'rotate(0.6turn) scale(0.6)', filter: 'blur(4.5px)' },
        { offset: 0.7, transform: 'rotate(0.7turn) scale(0.7)', filter: 'blur(3.5px)' },
        { offset: 0.8, transform: 'rotate(0.8turn) scale(0.8)', filter: 'blur(2.5px)' },
        { offset: 0.9, transform: 'rotate(0.9turn) scale(0.9)', filter: 'blur(1.5px)' },
        { offset: 1.0, transform: 'rotate(1.0turn) scale(1.0)', filter: 'blur(0px)' },
      ]);

    // prettier-ignore
    this.secondChanceAnimation = this.animationCtrl
      .create()
      .addElement(this.ref.nativeElement)
      .fill('none')
      .duration(550)
      .keyframes([
        { offset: 0.0, filter: 'blur(0px)' },
        { offset: 0.1, filter: 'blur(1.5px)' },
        { offset: 0.2, filter: 'blur(2.5px)' },
        { offset: 0.3, filter: 'blur(3.5px)' },
        { offset: 0.4, filter: 'blur(4.5px)' },
        { offset: 0.5, filter: 'blur(5px)' },
        { offset: 0.6, filter: 'blur(4.5px)' },
        { offset: 0.7, filter: 'blur(3.5px)' },
        { offset: 0.8, filter: 'blur(2.5px)' },
        { offset: 0.9, filter: 'blur(1.5px)' },
        { offset: 1.0, filter: 'blur(0px)' },
      ]);
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
