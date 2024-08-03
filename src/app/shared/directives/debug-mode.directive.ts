import { Directive, HostBinding, OnDestroy } from '@angular/core';
import { AppStateService } from '../services/app-state.service';
import { BaseComponent } from '../abstracts/base-component.abstract';

@Directive({
  selector: '[appDebugMode]',
})
export class DebugModeDirective extends BaseComponent implements OnDestroy {
  private appDebugModeSub$ = this.appStateServ.getAppDebugMode$().subscribe((v) => {
    this.display = v ? 'inherit' : 'none';
    this.color = v ? 'red' : 'inherit';
  });

  @HostBinding('style.display') display!: string;
  @HostBinding('style.color') color!: string;

  constructor(private readonly appStateServ: AppStateService) {
    super();
    this.registerSubscriptions([this.appDebugModeSub$]);
  }

  ngOnDestroy(): void {
    this.unsubscribeSubscriptions();
  }
}
