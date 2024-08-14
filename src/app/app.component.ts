import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subscription, fromEvent, lastValueFrom, map } from 'rxjs';
import { AppStateService } from './shared/services/app-state.service';
import { BaseComponent } from './shared/abstracts/base-component.abstract';
import { StatusBar, Style } from '@capacitor/status-bar';
import { ThemeService } from './game/theme/theme.service';
import { AppSettings } from './shared/services/app-state.types';
import { OptionsService } from './options/options.service';
import { EffectHandlerService } from './shared/services/effect-handler.service';
import { environment } from 'src/environments/environment';
import { ScreenOrientation } from '@capacitor/screen-orientation';
import { NavigationBar } from '@hugotomazi/capacitor-navigation-bar';

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

  private adjustBarColorSub$: Subscription = this.themeServ
    .get$()
    .pipe(map((v) => v.find((f) => f.active)))
    .subscribe(async (activeTheme) => {
      if (activeTheme) {
        const deviceHexColor = getComputedStyle(document.documentElement).getPropertyValue(
          activeTheme?.deviceBarBackgroundScssVar
        );
        // Brzydki fix, ale z jakiegoś powodu nie za każdym razem zmienia
        // kolor paska nawigacji przy starcie. Timeout pomaga.
        setTimeout(async () => {
          try {
            await StatusBar.show();
            await StatusBar.setBackgroundColor({ color: deviceHexColor });
            await StatusBar.setStyle({ style: activeTheme.style as Style });
            await NavigationBar.setColor({ color: deviceHexColor, darkButtons: activeTheme.style === 'LIGHT' });
          } catch (e) {
            console.error(`%c [SudokuClick][Capacitor]`, 'color:yellow', (e as Error).message);
          }
        }, 300);
      }
    });

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
    this.registerSubscriptions([
      this.screenOrientationSubs$,
      this.appSettingsSub$,
      this.appDevModeSub$,
      this.adjustBarColorSub$,
    ]);
    this.themeServ.create();
  }

  async ngOnInit(): Promise<void> {
    await this.appStateServ.storageInit();
    this.setHeaderSize(screen.orientation.type, '0px', '44px');

    try {
      await ScreenOrientation.lock({ orientation: 'portrait' });
      await NavigationBar.hide();
    } catch (e) {
      console.info(`%c [SudokuClick][Capacitor]`, 'color:yellow', (e as Error).message);
    }

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

  async hideNavigationBar(): Promise<void> {
    await NavigationBar.hide();
  }
}
