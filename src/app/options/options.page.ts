import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { NavController } from '@ionic/angular';
import { OptionsService } from './options.service';
import { Option } from './options.types';
import { AppStateService } from '../shared/services/app-state.service';
import { Observable, Subscription } from 'rxjs';
import { Build } from '../shared/interfaces/core.interface';
import { BaseComponent } from '../shared/abstracts/base-component.abstract';

@Component({
  selector: 'app-options',
  templateUrl: './options.page.html',
  styleUrls: ['./options.page.scss'],
})
export class OptionsPage extends BaseComponent implements OnInit, OnDestroy {
  backPath!: string;
  private _options: Option[] = [];
  private devMode: boolean = false;
  private devModeSub$: Subscription = this.appStateServ.getAppDevMode$().subscribe((v) => (this.devMode = v));

  get options(): Option[] {
    return this._options;
  }

  private readonly _debugModeHoldTime = 1000;

  get debugModeHoldTime(): number {
    return this._debugModeHoldTime;
  }

  get buildVersion(): Observable<Build> {
    return this.appStateServ.getBuildVersionFile$();
  }

  constructor(
    private route: ActivatedRoute,
    private readonly navCtrl: NavController,
    private readonly optionsServ: OptionsService,
    private readonly appStateServ: AppStateService
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

  onToggleChange(event: number): void {
    this.optionsServ.toggleOption(event);
    this.optionsServ.save(this.options);
    this.appStateServ.onOptionButtonClick();
  }

  runDevMode(): void {
    this.appStateServ.setAppDevMode(!this.devMode);
    console.info(`%c [SudokuClick][AppDevMode] now is ${this.devMode ? 'ON' : 'OFF'}`, 'color:green');
  }
}
