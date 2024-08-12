import { style } from '@angular/animations';
import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { StatusBar, StatusBarInfo, Style } from '@capacitor/status-bar';
import { from, interval, map, of, Subscription, take, timer, zip } from 'rxjs';
import { BaseComponent } from 'src/app/shared/abstracts/base-component.abstract';

@Component({
  selector: 'app-developer',
  templateUrl: './developer.page.html',
  styleUrls: ['./developer.page.scss'],
})
export class DeveloperPage extends BaseComponent {
  backPath!: string;
  color!: string;

  private _statusBarInfo!: StatusBarInfo | undefined;
  private _statusBarFeaturesEnabled: boolean = false;

  get statusBarFeaturesEnabled(): boolean {
    return this._statusBarFeaturesEnabled;
  }

  get statusBarInfo(): StatusBarInfo | undefined {
    return this._statusBarInfo;
  }

  private _visible!: boolean | undefined;
  private _overlaysWebView!: boolean | undefined;
  private _style!: Style | undefined;
  private _backgroundColor!: string | undefined;

  constructor(private readonly route: ActivatedRoute) {
    super();
  }

  async ionViewDidEnter(): Promise<void> {
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
          this._visible = statusBarInfo?.visible;
          this._overlaysWebView = statusBarInfo?.overlays;
          this._style = statusBarInfo?.style;
          this._backgroundColor = statusBarInfo?.color;
        }),
    ]);
  }

  async ionViewDidLeave(): Promise<void> {
    this.unsubscribeSubscriptions();
  }

  async toggleStatusBarVisible(): Promise<void> {
    this._visible ? await StatusBar.hide() : await StatusBar.show();
  }

  async toggleStatusBarOverlaysWebView(): Promise<void> {
    this._overlaysWebView
      ? await StatusBar.setOverlaysWebView({ overlay: false })
      : await StatusBar.setOverlaysWebView({ overlay: true });
  }

  async toggleStatusBarStyle(): Promise<void> {
    this._style === Style.Dark
      ? await StatusBar.setStyle({ style: Style.Light })
      : await StatusBar.setStyle({ style: Style.Dark });
  }

  async inputColor(): Promise<void> {
    await StatusBar.setBackgroundColor({ color: this.color });
  }
}
