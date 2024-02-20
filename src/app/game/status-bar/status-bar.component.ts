import { AfterViewInit, Component, HostBinding, Input, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { AppStateService } from 'src/app/shared/services/app-state.service';
import { BasicOrientationType } from 'src/app/shared/services/app-state.types';
import { GameLevel } from 'src/app/shared/services/game-state.service';
import { ResizeObservableService } from 'src/app/shared/services/resize-observable.service';
import { TimerService } from 'src/app/shared/services/timer.service';
import { ConversionUtil } from 'src/app/shared/utils/conversion.util';

@Component({
  selector: 'app-status-bar',
  templateUrl: './status-bar.component.html',
  styleUrls: ['./status-bar.component.scss'],
})
export class StatusBarComponent implements OnInit, OnDestroy {
  @Input() level!: GameLevel;

  get levelName() {
    return ConversionUtil.firstUpper(this.level.name);
  }

  get timestring() {
    return this.timerServ.getTimestring();
  }

  constructor(private appStateServ: AppStateService, private timerServ: TimerService) {
    // this.time = this.timerServ.timestring;
  }

  ngOnInit() {
    // console.log('bar init');
  }

  ngOnDestroy(): void {
    // console.log('bar dest');
  }
}
