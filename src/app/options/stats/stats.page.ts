import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Level } from 'src/app/shared/services/game-state.service';
import { StatsService } from './stats.service';
import { BaseComponent } from 'src/app/shared/abstracts/base-component.abstract';
import { combineLatest, last, map, of, Subscription } from 'rxjs';
import { CurrentItem, Stat, SummaryGames, SummaryStats } from './stats.types';
import { LoadingController } from '@ionic/angular';
import { AppStateService } from 'src/app/shared/services/app-state.service';

type MenuLevelOption = {
  id: number;
  value: string;
};

@Component({
  selector: 'app-stats',
  templateUrl: './stats.page.html',
  styleUrls: ['./stats.page.scss'],
})
export class StatsPage extends BaseComponent {
  backPath!: string;
  summarizedStats!: SummaryStats[];
  summarizedGames!: SummaryGames[];
  currentTabValue!: string;
  currentItem!: CurrentItem;
  loading!: HTMLIonLoadingElement;
  private _commonStatistics: Stat[] = [];
  private queryParamsSub$!: Subscription;

  private _devMode: boolean = false;
  private devModeSub$: Subscription = this.appStateServ.getAppDevMode$().subscribe((v) => (this._devMode = v));
  private tabValueSub$: Subscription = combineLatest([of(Object.values(Level)), this.appStateServ.getAppDevMode$()])
    .pipe(map(([level, devMode]) => level.filter((v) => (devMode ? true : !v.includes('DEV')))))
    .subscribe((v) => (this.currentTabValue = v[0]));

  get devMode(): boolean {
    return this._devMode;
  }

  get levels(): MenuLevelOption[] {
    return Object.values(Level)
      .filter((v) => (this.devMode ? true : !v.includes('DEV')))
      .map((item, index) => ({
        id: index,
        value: item,
      }));
  }

  constructor(
    private readonly route: ActivatedRoute,
    private readonly statsServ: StatsService,
    private readonly loadingCtrl: LoadingController,
    private readonly appStateServ: AppStateService
  ) {
    super();
  }

  async showLoading() {
    this.loading = await this.loadingCtrl.create({
      message: 'Loading statistics...',
    });
    this.loading.present();
  }

  async hideLoading() {
    await this.loading.dismiss();
  }

  async ionViewDidEnter(): Promise<void> {
    this.queryParamsSub$ = this.route.queryParams.subscribe((params) => {
      this.backPath = params['parent'] ? params['parent'] : '/home';
    });
    this.registerSubscriptions([this.queryParamsSub$, this.devModeSub$, this.tabValueSub$]);
    await this.showLoading();
    await this.loadStats();
    await this.hideLoading();
  }

  async ionViewDidLeave(): Promise<void> {
    this.unsubscribeSubscriptions();
  }

  async loadStats(): Promise<void> {
    this.isReady = false;
    this._commonStatistics = await this.statsServ.load();
    this.summarizedStats = this.statsServ.processStats(this._commonStatistics);
    this.summarizedGames = this.statsServ.processGames(this._commonStatistics);
    this.selectCategory(this.currentTabValue);
    this.isReady = true;
  }

  selectCategory(level: Level | string): void {
    this.currentItem = {
      summaryStats: this.summarizedStats.find((i) => i.level === level),
      summaryGames: this.summarizedGames.find((i) => i.level === level),
    };
  }
}
