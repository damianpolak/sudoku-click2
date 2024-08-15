import { style } from '@angular/animations';
import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ScreenOrientation } from '@capacitor/screen-orientation';
import { StatusBar, StatusBarInfo, Style } from '@capacitor/status-bar';
import { NavigationBar, NavigationBarPluginEvents } from '@hugotomazi/capacitor-navigation-bar';
import { from, interval, map, of, Subscription, take, timer, zip } from 'rxjs';
import { BaseComponent } from 'src/app/shared/abstracts/base-component.abstract';
import { StorageService } from 'src/app/shared/services/storage.service';

@Component({
  selector: 'app-developer',
  templateUrl: './developer.page.html',
  styleUrls: ['./developer.page.scss'],
})
export class DeveloperPage extends BaseComponent {
  backPath!: string;
  color!: string;
  colorNavigationBar!: string;

  private _sudokuAppSettings!: string;

  get sudokuAppSettings(): string {
    return this._sudokuAppSettings;
  }

  // StatusBar
  private _statusBarInfo!: StatusBarInfo | undefined;
  private _statusBarFeaturesEnabled: boolean = false;
  private _statusBarVisible!: boolean | undefined;
  private _statusBarOverlay!: boolean | undefined;
  private _statusBarStyle!: Style | undefined;
  private _statusBarBackgroundColor!: string | undefined;

  get statusBarFeaturesEnabled(): boolean {
    return this._statusBarFeaturesEnabled;
  }

  get statusBarInfo(): StatusBarInfo | undefined {
    return this._statusBarInfo;
  }

  // NavigationBar
  private _navigationBarInfo!: undefined;
  // private _navigationBarVisible: boolean = true;

  showOrHide: 'show' | 'hide' = 'show';

  constructor(private readonly route: ActivatedRoute, private readonly storageService: StorageService) {
    super();
  }

  async ionViewDidEnter(): Promise<void> {
    this._sudokuAppSettings = JSON.stringify(await this.storageService.get('SUDOKU_APP_SETTINGS'));

    const asd = await NavigationBar.addListener(NavigationBarPluginEvents.SHOW, () => {
      this.showOrHide = 'show';
    });

    await NavigationBar.addListener(NavigationBarPluginEvents.HIDE, () => {
      this.showOrHide = 'hide';
    });

    this.registerSubscriptions([
      this.route.queryParams.subscribe((params) => {
        this.backPath = params['parent'] ? params['parent'] : '/home';
      }),
      interval(1000)
        .pipe(map(async (i) => StatusBar.getInfo().catch((e) => undefined)))
        .subscribe(async (v) => {
          const statusBarInfo = await v;
          this._statusBarFeaturesEnabled = statusBarInfo !== undefined;
          this._statusBarInfo = statusBarInfo;
          this._statusBarVisible = statusBarInfo?.visible;
          this._statusBarOverlay = statusBarInfo?.overlays;
          this._statusBarStyle = statusBarInfo?.style;
          this._statusBarBackgroundColor = statusBarInfo?.color;
        }),
    ]);
  }

  async ionViewDidLeave(): Promise<void> {
    this.unsubscribeSubscriptions();
  }

  async toggleStatusBarVisible(): Promise<void> {
    this._statusBarVisible ? await StatusBar.hide() : await StatusBar.show();
  }

  async toggleStatusBarOverlaysWebView(): Promise<void> {
    this._statusBarOverlay
      ? await StatusBar.setOverlaysWebView({ overlay: false })
      : await StatusBar.setOverlaysWebView({ overlay: true });
  }

  async toggleStatusBarStyle(): Promise<void> {
    this._statusBarStyle === Style.Dark
      ? await StatusBar.setStyle({ style: Style.Light })
      : await StatusBar.setStyle({ style: Style.Dark });
  }

  async inputColor(): Promise<void> {
    await StatusBar.setBackgroundColor({ color: this.color });
  }

  async setNavigationBar(mode: 'show' | 'hide'): Promise<void> {
    mode === 'show' ? await NavigationBar.show() : await NavigationBar.hide();
  }

  async inputColorNavigationBar(): Promise<void> {
    await NavigationBar.setColor({ color: this.colorNavigationBar });
  }

  async setScreenOrientation(mode: 'lock' | 'unlock'): Promise<void> {
    mode === 'lock' ? await ScreenOrientation.lock({ orientation: 'portrait' }) : await ScreenOrientation.unlock();
  }
}
