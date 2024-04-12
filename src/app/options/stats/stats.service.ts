import { Injectable } from '@angular/core';
import { StorageService } from 'src/app/shared/services/storage.service';
import { Stat, SummaryStats } from './stats.types';
import { GameLevel, Level } from 'src/app/shared/services/game-state.service';
import { GameStatusType } from 'src/app/shared/services/game-state.types';

@Injectable({
  providedIn: 'root',
})
export class StatsService {
  private static readonly GAME_STATS_KEY = 'SUDOKU_GAME_STATS' as const;

  constructor(private readonly storageServ: StorageService) {}

  async save(value: Stat): Promise<void> {
    try {
      let stats = await this.load();
      await this.storageServ.set(StatsService.GAME_STATS_KEY, [...stats, ...[value]]);
    } catch (e) {
      console.log('Cannot save player stats');
    }
  }

  async load(): Promise<Stat[]> {
    try {
      const stats = await this.storageServ.get(StatsService.GAME_STATS_KEY);
      return stats ? stats : [];
    } catch (e) {
      console.log('An error occured when trying to load player stats');
      return [];
    }
  }

  countStartedGames(level: Level, statistics: Stat[]): number {
    return statistics.filter((i) => i.level === level && i.statsable).length;
  }

  countWins(level: Level, statistics: Stat[]): number {
    return statistics.filter((i) => i.level === level && i.statsable && i.status === GameStatusType.VICTORY).length;
  }

  highScore(level: Level, statistics: Stat[]): number {
    const score = Math.max(...statistics.filter((i) => i.level === level && i.statsable).map((i) => i.score));
    return Number.isFinite(score) ? score : 0;
  }

  winsRatio(level: Level, statistics: Stat[]): number {
    const ratio =
      (100 * this.countWins(level, statistics)) / statistics.filter((i) => i.level === level && i.statsable).length;
    return Number.isNaN(ratio) ? 0 : ratio;
  }

  countFlawlessWins(level: Level, statistics: Stat[]): number {
    return statistics
      .filter((i) => i.level === level && i.statsable && i.status === GameStatusType.VICTORY)
      .map((i) => i.mistakes)
      .filter((i) => i === 0).length;
  }

  countPerfectWins(level: Level, statistics: Stat[]): number {
    return statistics
      .filter((i) => i.level === level && i.statsable && i.status === GameStatusType.VICTORY)
      .map((i) => ({ mistakes: i.mistakes, score: i.score }))
      .filter((i) => i.mistakes === 0 && i.score === new GameLevel(level).maxScore()).length;
  }

  processStats(statistics: Stat[]): SummaryStats[] {
    return Object.values(Level).map((i) => {
      return {
        level: i,
        stats: [
          {
            name: 'total',
            title: 'Total games',
            icon: 'game-controller-outline',
            color: 'default',
            value: this.countStartedGames(i, statistics),
          },
          {
            name: 'wins',
            title: 'Total wins',
            icon: 'trophy-outline',
            color: 'default',
            value: this.countWins(i, statistics),
          },
          {
            name: 'flawlessRatio',
            title: 'Flawless games',
            icon: 'bonfire-outline',
            color: 'default',
            value: this.countFlawlessWins(i, statistics),
          },
          {
            name: 'perfectWins',
            title: 'Perfect games',
            icon: 'heart-outline',
            color: 'default',
            value: this.countPerfectWins(i, statistics),
          },
          {
            name: 'highscore',
            title: 'High score',
            icon: 'analytics-outline',
            color: 'default',
            value: this.highScore(i, statistics),
          },
          {
            name: 'winsRatio',
            title: 'Wins ratio',
            icon: 'podium-outline',
            color: 'default',
            value: this.winsRatio(i, statistics) + '%',
          },
        ],
      };
    });
  }
}
