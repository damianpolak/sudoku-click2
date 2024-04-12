import { Level } from 'src/app/shared/services/game-state.service';
import { GameStatusType } from 'src/app/shared/services/game-state.types';

export type Stat = {
  level: Level;
  status: GameStatusType;
  score: number;
  time: string;
  mistakes: number;
  statsable: boolean;
};

export interface StatExtended extends Stat {
  perfectWins: number;
  highscore: number;
}

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
