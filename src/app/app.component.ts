import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subscription, fromEvent } from 'rxjs';
import { AppStateService } from './shared/services/app-state.service';
import { BaseComponent } from './shared/abstracts/base-component.abstract';
import { StatusBar } from '@capacitor/status-bar';
import { ThemeService } from './game/theme/theme.service';
import { AppSettings } from './shared/services/app-state.types';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
})
export class AppComponent extends BaseComponent implements OnInit, OnDestroy {
  private screenOrientationSubs$: Subscription;
  private appSettingsSub$: Subscription = this.appStateServ
    .getAppSettings$()
    .subscribe((appSettings) => this.appStateServ.saveAppSettings(appSettings));

  constructor(private appStateServ: AppStateService, private readonly themeServ: ThemeService) {
    super();
    this.appStateServ.setScreenOrientation(screen.orientation.type);
    this.screenOrientationSubs$ = fromEvent(screen.orientation, 'change').subscribe((x) => {
      const orientation = (x.target as ScreenOrientation).type;
      this.appStateServ.setScreenOrientation(orientation);
      this.setHeaderSize(orientation, '0px', '44px');
    });
    this.registerSubscriptions([this.screenOrientationSubs$, this.appSettingsSub$]);
    this.themeServ.create();
  }

  async ngOnInit(): Promise<void> {
    await this.appStateServ.storageInit();
    this.setHeaderSize(screen.orientation.type, '0px', '44px');
    await StatusBar.hide().catch((e) => {
      console.log(`[SudokuClick][Capacitor]`, (e as Error).message);
    });

    const appSettings: AppSettings | undefined = await this.appStateServ.loadStorageSettings();

    this.themeServ.register(
      [
        { name: 'light', background: 'var(--ion-theme-light-presentable)' },
        { name: 'dark', background: 'var(--ion-theme-dark-presentable)' },
        { name: 'pastel', background: 'var(--ion-theme-pastel-presentable)' },
      ],
      appSettings ? appSettings.theme : undefined
    );
  }

  ngOnDestroy(): void {
    this.unsubscribeSubscriptions();
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
