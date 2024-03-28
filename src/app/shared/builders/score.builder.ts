import { Score } from 'src/app/game/board/field/field.types';

export class ScoreBuilder implements Score {
  scored!: boolean;
  score!: number;

  constructor(payload?: Score, isCorrectValue?: boolean, multiplier?: number) {
    this.assignValue(payload, isCorrectValue, multiplier);
  }

  protected assignValue(payload?: Score, isCorrectValue?: boolean, multiplier?: number): this {
    if (payload && isCorrectValue && multiplier) {
      if (!payload.scored) {
        this.scored = true;
        this.score = isCorrectValue ? payload.score + multiplier : payload.score + 0;
      } else {
        this.scored = true;
        this.score = payload.score;
      }
    } else {
      this.score = 0;
      this.scored = false;
    }
    return this;
  }

  get(): Score {
    return {
      scored: this.scored,
      score: this.score,
    };
  }
}
