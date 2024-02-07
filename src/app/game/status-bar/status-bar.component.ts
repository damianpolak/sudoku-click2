import { AfterViewInit, Component, HostBinding, Input, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { AppStateService } from 'src/app/shared/services/app-state.service';
import { BasicOrientationType } from 'src/app/shared/services/app-state.types';
import { GameLevel } from 'src/app/shared/services/game-state.service';
import { ResizeObservableService } from 'src/app/shared/services/resize-observable.service';

@Component({
  selector: 'app-status-bar',
  templateUrl: './status-bar.component.html',
  styleUrls: ['./status-bar.component.scss'],
})
export class StatusBarComponent  implements OnInit, OnDestroy {

  @Input() level!: GameLevel;
  // @HostBinding('style.width') width = '100%';

  // screenOrientation!: BasicOrientationType;
  // screenOrientationSubs$!: Subscription;

  constructor(private appStateServ: AppStateService) { }

  ngOnInit() {
    console.log();
    // this.screenOrientationSubs$ = this.appStateServ.getScreenOrientation$().subscribe(orientation => {
    //   this.screenOrientation = orientation;
    // });

    // const gameContainer = document.querySelector('.board') as Element;
    // const resizeObserver = new ResizeObserver((entries) => {
    //   for (const entry of entries) {
    //     if (entry.contentBoxSize) {
    //         this.width = this.screenOrientation === 'portrait' ? `${entry.target.clientWidth}px` : '100%';
    //     }
    //   }
    // });
    // resizeObserver.observe(gameContainer);
  }

  ngOnDestroy(): void {
    console.log();
    // this.screenOrientationSubs$.unsubscribe();
  }

}
