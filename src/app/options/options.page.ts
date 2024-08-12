import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { NavController } from '@ionic/angular';
import { OptionsService } from './options.service';
import { Option } from './options.types';
import { AppStateService } from '../shared/services/app-state.service';
import { Observable, Subscription } from 'rxjs';
import { Build } from '../shared/interfaces/core.interface';
import { BaseComponent } from '../shared/abstracts/base-component.abstract';
import { StorageService } from '../shared/services/storage.service';

@Component({
  selector: 'app-options',
  templateUrl: './options.page.html',
  styleUrls: ['./options.page.scss'],
})
export class OptionsPage extends BaseComponent implements OnInit, OnDestroy {
  backPath!: string;
  private _options: Option[] = [];
  private _devMode: boolean = false;
  private devModeSub$: Subscription = this.appStateServ.getAppDevMode$().subscribe((v) => (this._devMode = v));

  get devMode(): boolean {
    return this._devMode;
  }

  get options(): Option[] {
    return this._options;
  }

  private readonly _debugModeHoldTime = 10000;

  get debugModeHoldTime(): number {
    return this._debugModeHoldTime;
  }

  get buildVersion(): Observable<Build> {
    return this.appStateServ.getBuildVersionFile$();
  }

  constructor(
    private readonly route: ActivatedRoute,
    private readonly navCtrl: NavController,
    private readonly optionsServ: OptionsService,
    private readonly appStateServ: AppStateService,
    private readonly storageServ: StorageService
  ) {
    super();
    this._options = this.optionsServ.options;
    this.registerSubscriptions([this.devModeSub$]);
  }

  async ngOnInit(): Promise<void> {
    this.route.queryParams.subscribe((params) => {
      this.backPath = params['parent'] ? params['parent'] : '/home';
    });
  }

  ngOnDestroy(): void {
    this.unsubscribeSubscriptions();
  }

  async onMenuItemClick(): Promise<void> {
    await this.navCtrl.navigateForward('options/stats', { queryParams: { parent: 'options' } });
    this.appStateServ.onOptionButtonClick();
  }

  async onDeveloperMenuItemClick(): Promise<void> {
    await this.navCtrl.navigateForward('options/developer', { queryParams: { parent: 'options' } });
    this.appStateServ.onOptionButtonClick();
  }

  onToggleChange(event: number): void {
    this.optionsServ.toggleOption(event);
    this.optionsServ.save(this.options);
    this.appStateServ.onOptionButtonClick();
  }

  runDevMode(): void {
    this.appStateServ.setAppDevMode(!this._devMode);
    console.info(`%c [SudokuClick][AppDevMode] now is ${this._devMode ? 'ON' : 'OFF'}`, 'color:green');
  }

  async restartApp(): Promise<void> {
    location.reload();
  }

  async restoreDefaults(): Promise<void> {
    await this.storageServ.clearStorage();
    setTimeout(() => {
      location.reload();
    }, 1000);
  }
}
