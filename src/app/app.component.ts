import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subscription, fromEvent } from 'rxjs';
import { AppStateService } from './shared/services/app-state.service';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
})
export class AppComponent implements OnInit, OnDestroy {
  private readonly autoThemeMode: boolean = false;
  private screenOrientationSubs$: Subscription;

  constructor(private appStateServ: AppStateService) {
    this.themeToggler();
    this.appStateServ.setScreenOrientation(screen.orientation.type);
    this.screenOrientationSubs$ = fromEvent(screen.orientation, 'change').subscribe((x) => {
      const orientation = (x.target as ScreenOrientation).type;
      this.appStateServ.setScreenOrientation(orientation);
      this.setHeaderSize(orientation, '0px', '44px');
    });
  }

  ngOnInit(): void {
    this.setHeaderSize(screen.orientation.type, '0px', '44px');
  }

  ngOnDestroy(): void {
    this.screenOrientationSubs$.unsubscribe();
  }

  private themeToggler(): void {
    if (this.autoThemeMode) {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)');
      if (prefersDark.matches) {
        this.setTheme('dark');
      } else {
        this.setTheme('light');
      }
    } else {
      this.setTheme('dark');
    }
  }

  private setTheme(theme: 'light' | 'dark'): void {
    document.body.classList.toggle(theme, true);
  }

  private setHeaderSize(
    orientation: OrientationType,
    portraitValue: `${number}px`,
    landscapeValue: `${number}px`
  ): void {
    if (orientation === 'portrait-primary' || orientation === 'portrait-secondary') {
      document.documentElement.style.setProperty('--header-size', portraitValue);
    } else {
      document.documentElement.style.setProperty('--header-size', landscapeValue);
    }
  }
}
