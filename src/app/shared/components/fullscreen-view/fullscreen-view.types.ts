export type FinishGameActionType = 'SECOND_CHANCE' | 'RESTART' | 'NEW_GAME';
export enum FinishGameType {
  VICTORY = 'VICTORY',
  LOSS = 'LOSS',
}
export type FinishGame = {
  title: string;
  description: string;
  finishType?: FinishGameType;
};
