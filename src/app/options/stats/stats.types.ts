import { Level } from 'src/app/shared/services/game-state.service';
import { GameStatusType } from 'src/app/shared/services/game-state.types';

export type CurrentItem = {
  summaryStats: SummaryStats | undefined;
  summaryGames: SummaryGames | undefined;
};

export type Stat = {
  level: Level;
  status: GameStatusType;
  score: number;
  time: string;
  mistakes: number;
  statsable: boolean;
  datetime: Date;
};

export type SummaryStats = {
  level: Level;
  stats: StatDetail[];
};

export type StatDetail = {
  name: string;
  title: string;
  icon: string;
  color: string;
  value: number | string;
};

export type SummaryGames = {
  level: Level;
  games: GameDetail[];
};

export interface GameDetail extends Omit<Stat, 'level' | 'statsable' | 'datetime'> {
  id: number;
  icon: string;
  color: string;
  datestring: string;
}
