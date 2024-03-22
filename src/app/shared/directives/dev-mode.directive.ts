import { Directive, HostBinding, OnDestroy } from '@angular/core';
import { AppStateService } from '../services/app-state.service';
import { BaseComponent } from '../abstracts/base-component.abstract';

@Directive({
  selector: '[appDevMode]',
})
export class DevModeDirective extends BaseComponent implements OnDestroy {
  private appDevModeSub$ = this.appStateServ.getAppDevMode$().subscribe((v) => {
    this.display = v ? 'inherit' : 'none';
    this.color = v ? 'red' : 'inherit';
  });

  @HostBinding('style.display') display!: string;
  @HostBinding('style.color') color!: string;

  constructor(private appStateServ: AppStateService) {
    super();
    this.registerSubscriptions([this.appDevModeSub$]);
  }

  ngOnDestroy(): void {
    this.unsubscribeSubscriptions();
  }
}
