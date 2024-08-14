import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subscription, fromEvent, lastValueFrom } from 'rxjs';
import { AppStateService } from './shared/services/app-state.service';
import { BaseComponent } from './shared/abstracts/base-component.abstract';
import { StatusBar } from '@capacitor/status-bar';
import { ThemeService } from './game/theme/theme.service';
import { AppSettings } from './shared/services/app-state.types';
import { OptionsService } from './options/options.service';
import { EffectHandlerService } from './shared/services/effect-handler.service';
import { environment } from 'src/environments/environment';
import { ScreenOrientation } from '@capacitor/screen-orientation';

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

  private appDevModeSub$: Subscription = this.appStateServ
    .getAppDevMode$()
    .subscribe((v) => this.appStateServ.setAppSettings({ devMode: v }));

  constructor(
    private readonly appStateServ: AppStateService,
    private readonly themeServ: ThemeService,
    private readonly optionsServ: OptionsService,
    private readonly effectHandlerServ: EffectHandlerService
  ) {
    super();
    this.displayBuildVersion();
    this.appStateServ.setScreenOrientation(screen.orientation.type);
    this.screenOrientationSubs$ = fromEvent(screen.orientation, 'change').subscribe((x) => {
      const orientation = (x.target as ScreenOrientation).type;
      this.appStateServ.setScreenOrientation(orientation);
      this.setHeaderSize(orientation, '0px', '44px');
    });
    this.registerSubscriptions([this.screenOrientationSubs$, this.appSettingsSub$, this.appDevModeSub$]);
    this.themeServ.create();
  }

  async ngOnInit(): Promise<void> {
    await this.appStateServ.storageInit();
    this.setHeaderSize(screen.orientation.type, '0px', '44px');
    await StatusBar.hide().catch((e) => {
      console.info(`%c [SudokuClick][Capacitor]`, 'color:yellow', (e as Error).message);
    });

    await ScreenOrientation.lock({ orientation: 'portrait' }).catch((e) => {
      console.log(`%c [SudokuClick][Capacitor]`, 'color:yellow', (e as Error).message);
    });

    const appSettings: AppSettings | undefined = await this.appStateServ.loadStorageSettings();

    this.themeServ.register(
      [
        {
          name: 'light',
          backgroundScssVar: '--ion-theme-light-presentable',
          deviceBarBackgroundScssVar: '--ion-theme-light-device-bar',
          style: 'LIGHT',
        },
        {
          name: 'dark',
          backgroundScssVar: '--ion-theme-dark-presentable',
          deviceBarBackgroundScssVar: '--ion-theme-dark-device-bar',
          style: 'DARK',
        },
        {
          name: 'apricot',
          backgroundScssVar: '--ion-theme-apricot-presentable',
          deviceBarBackgroundScssVar: '--ion-theme-apricot-device-bar',
          style: 'LIGHT',
        },
      ],
      appSettings ? appSettings.theme : undefined
    );
    await this.optionsServ.register();

    // Set devMode
    appSettings?.devMode !== undefined
      ? this.appStateServ.setAppDevMode(appSettings.devMode)
      : this.appStateServ.setAppDevMode(false);
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

  async displayBuildVersion(): Promise<void> {
    try {
      const buildVersionFile = await lastValueFrom(this.appStateServ.getBuildVersionFile$());
      console.log(
        `%cApp version: ${environment.version}`,
        `background: #0082af; padding: 8px 12px; border-radius: 4px; color: #fafafa; font-size: large`
      );
      console.log(
        `%cBuild number: ${buildVersionFile?.buildVersion}`,
        `background: #0082af; padding: 8px 12px; border-radius: 4px; color: #fafafa; font-size: large`
      );
    } catch (e) {
      console.warn(e);
    }
  }
}
