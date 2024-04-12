import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Level } from 'src/app/shared/services/game-state.service';
import { StatsService } from './stats.service';
import { BaseComponent } from 'src/app/shared/abstracts/base-component.abstract';
import { Subscription } from 'rxjs';
import { Stat, SummaryStats } from './stats.types';
import { LoadingController } from '@ionic/angular';

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
  summarized!: SummaryStats[];
  currentTabValue: string = Object.values(Level)[0];
  currentStatItem!: SummaryStats | undefined;
  private commonStatistics: Stat[] = [];
  private queryParamsSub$!: Subscription;

  constructor(
    private route: ActivatedRoute,
    private readonly statsServ: StatsService,
    private readonly loadingCtrl: LoadingController
  ) {
    super();
  }

  loading!: HTMLIonLoadingElement;
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
    this.registerSubscriptions([this.queryParamsSub$]);
    await this.showLoading();
    await this.loadStats();
    await this.hideLoading();
  }

  async ionViewDidLeave(): Promise<void> {
    this.unsubscribeSubscriptions();
  }

  get levels(): MenuLevelOption[] {
    return Object.values(Level).map((item, index) => {
      return {
        id: index,
        value: item,
      };
    });
  }

  async loadStats(): Promise<void> {
    this.isReady = false;
    // await new Promise((resolve) => setTimeout(resolve, 3000));
    this.commonStatistics = await this.statsServ.load();
    this.summarized = this.statsServ.processStats(this.commonStatistics);
    this.selectCategory(this.currentTabValue);
    this.isReady = true;
  }

  selectCategory(level: Level | string): void {
    this.currentStatItem = this.summarized.find((i) => i.level === level);
  }
}
