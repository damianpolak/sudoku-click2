export interface Animated {
  animationsEnabled: boolean;
  setAnimation(): void;
}

export type KeyName = `SUDOKU_${string}`;

export type BuildVersion = `${number}.${number}.${number}-build.${number}.${number}.${number}`;

export type Build = {
  appVersion: string | 'no info';
  iterationNumber: number;
  compilationNumber: number;
  buildVersion: BuildVersion | 'no info';
};
