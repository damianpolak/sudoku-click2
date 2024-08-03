import { Theme, ThemeDefinition } from 'src/app/game/theme/theme.service';

export type BasicOrientationType = 'portrait' | 'landscape';

export type AppSettings = {
  theme: Theme;
  devMode: boolean;
};
