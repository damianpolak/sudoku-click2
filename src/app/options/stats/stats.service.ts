import { Injectable } from '@angular/core';
import { StorageService } from 'src/app/shared/services/storage.service';
import { Stat, SummaryGames, SummaryStats } from './stats.types';
import { GameLevel, Level } from 'src/app/shared/services/game-state.service';
import { GameStatusType } from 'src/app/shared/services/game-state.types';
import { ConversionUtil } from 'src/app/shared/utils/conversion.util';
import { Menu } from 'src/app/shared/abstracts/menu.abstract';
import { KeyName } from 'src/app/shared/interfaces/core.interface';

@Injectable({
  providedIn: 'root',
})
export class StatsService extends Menu<Stat> {
  protected readonly storageKey: KeyName = 'SUDOKU_GAME_STATS' as const;
  protected readonly _entityName: string = 'STATS';

  constructor(protected override readonly storageServ: StorageService) {
    super(storageServ);
  }

  async removeLast(): Promise<void> {
    try {
      const stats = await this.load();
      await this.storageServ.set(this.storageKey, stats.splice(0, stats.length - 1));
    } catch (e) {
      console.error(`Cannot remove last item from ${this.entityName}`);
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

  bestWorstTime(level: Level, statistics: Stat[], option: { type: 'best' | 'worst' }): string {
    const bestOrWorst = (type: 'best' | 'worst', ...values: number[]): number => {
      return type === 'best' ? Math.min(...values) : Math.max(...values);
    };

    const timeResult = statistics
      .filter((i) => i.level === level && i.statsable && i.status === GameStatusType.VICTORY)
      .map((i) => ({ time: i.time, timeScoring: parseInt(ConversionUtil.replaceChar(i.time, ':', ''), 16) }));
    const result = timeResult.find(
      (i) => i.timeScoring === bestOrWorst(option.type, ...timeResult.map((i) => i.timeScoring))
    )?.time as string;
    return result ? result : 'N/A';
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
            value: Number(this.winsRatio(i, statistics).toPrecision(2)) + '%',
          },
          {
            name: 'bestTime',
            title: 'Best time',
            icon: 'arrow-up-outline',
            color: 'default',
            value: this.bestWorstTime(i, statistics, { type: 'best' }),
          },
          {
            name: 'worstTime',
            title: 'Worst time',
            icon: 'arrow-down-outline',
            color: 'default',
            value: this.bestWorstTime(i, statistics, { type: 'worst' }),
          },
        ],
      };
    });
  }

  processGames(statistics: Stat[]): SummaryGames[] {
    return Object.values(Level).map((i) => {
      return {
        level: i,
        games: statistics
          .filter((j) => j.level === i && j.statsable)
          .map((j, index) => {
            return {
              id: index,
              status: j.status,
              score: j.score,
              time: j.time,
              mistakes: j.mistakes,
              icon: j.status === GameStatusType.VICTORY ? 'trophy-outline' : 'skull-outline',
              color: 'default',
              datestring: j.datetime ? j.datetime.toLocaleString() : 'n/a',
            };
          }),
      };
    });
  }
}
