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
    return Math.max(...statistics.filter((i) => i.level === level && i.statsable).map((i) => i.score));
  }

  winsRatio(level: Level, statistics: Stat[]): number {
    const wins = this.countWins(level, statistics);
    return (100 * wins) / statistics.filter((i) => i.level === level && i.statsable).length;
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

  processStats(statistics: Stat[]): SummaryStats {
    return Object.values(Level).reduce((acc: SummaryStats, curr, index) => {
      acc[`${curr}`] = {
        wins: this.countWins(curr, statistics),
        total: this.countStartedGames(curr, statistics),
        highscore: this.highScore(curr, statistics),
        winsRatio: this.winsRatio(curr, statistics),
        flawlessRatio: this.countFlawlessWins(curr, statistics),
        perfectWins: this.countPerfectWins(curr, statistics),
      };
      return acc;
    }, {});
  }
}
