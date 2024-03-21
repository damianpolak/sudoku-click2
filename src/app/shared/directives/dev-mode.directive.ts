import { Directive, HostBinding, OnDestroy } from '@angular/core';
import { AppStateService } from '../services/app-state.service';

@Directive({
  selector: '[appDevMode]',
})
export class DevModeDirective implements OnDestroy {
  private appDevModeSub$ = this.appStateServ.getAppDevMode$().subscribe((v) => {
    this.display = v ? 'inherit' : 'none';
    this.color = v ? 'red' : 'inherit';
  });

  @HostBinding('style.display') display!: string;
  @HostBinding('style.color') color!: string;

  constructor(private appStateServ: AppStateService) {}

  ngOnDestroy(): void {
    this.appDevModeSub$.unsubscribe();
  }
}
