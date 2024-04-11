import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Level } from 'src/app/shared/services/game-state.service';
import { ConversionUtil } from 'src/app/shared/utils/conversion.util';
import { StatsService } from './stats.service';
import { BaseComponent } from 'src/app/shared/abstracts/base-component.abstract';
import { Subscription } from 'rxjs';
import { Stat, SummaryStats } from './stats.types';

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
  private commonStatistics: Stat[] = [];
  summarized!: SummaryStats;
  private queryParamsSub$!: Subscription;
  constructor(private route: ActivatedRoute, private readonly statsServ: StatsService) {
    super();
  }

  async ionViewDidEnter(): Promise<void> {
    this.queryParamsSub$ = this.route.queryParams.subscribe((params) => {
      this.backPath = params['parent'] ? params['parent'] : '/home';
    });
    this.registerSubscriptions([this.queryParamsSub$]);
    console.log('=== isReady', this.isReady);
    await this.loadStats();
    console.log();
    const wins = this.statsServ.countWins(Level.DEV, this.commonStatistics);
    const highscore = this.statsServ.highScore(Level.DEV, this.commonStatistics);
    const winsRatio = this.statsServ.winsRatio(Level.DEV, this.commonStatistics);
    const flawless = this.statsServ.countFlawlessWins(Level.DEV, this.commonStatistics);
    const perfect = this.statsServ.countPerfectWins(Level.DEV, this.commonStatistics);

    console.log('=== Dev wins', wins, highscore, winsRatio, flawless, perfect);
    this.summarized = this.statsServ.processStats(this.commonStatistics);
    console.log(this.summarized);
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
    this.commonStatistics = await this.statsServ.load();
    this.isReady = true;
  }

  onSelectCategory(level: Level | string): void {
    console.log(
      `=== onSelectCategory: ${level}`,
      this.commonStatistics.filter((i) => {
        return i.level === level;
      })
    );
  }
}
