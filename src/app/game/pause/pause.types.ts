export type PauseModalActionType = 'CONTINUE' | 'RESTART' | 'CANCELGAME' | 'DISMISS';
export type PauseGameInfo = {
  time: `${number}${number}:${number}${number}` | `${number}${number}:${number}${number}:${number}${number}`;
  level: string;
  mistakes: string;
}
