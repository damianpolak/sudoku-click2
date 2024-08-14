import { Injectable } from '@angular/core';
import { ServiceStore } from 'src/app/shared/abstracts/service-store.abstract';
import { AppStateService } from 'src/app/shared/services/app-state.service';

export type Theme = string;
export type ThemeDefinition = {
  name: Theme;
  active?: boolean;
  backgroundScssVar: string;
  deviceBarBackgroundScssVar: string;
  style: 'LIGHT' | 'DARK';
};

@Injectable({
  providedIn: 'root',
})
export class ThemeService extends ServiceStore<ThemeDefinition> {
  private readonly autoThemeMode: boolean = false;

  constructor(private readonly appStateServ: AppStateService) {
    super();
  }

  register(themes: ThemeDefinition[], active?: ThemeDefinition): void {
    const isPrefersDark = this.isPrefersDark();
    const activeTheme: ThemeDefinition =
      active ||
      (isPrefersDark
        ? {
            name: 'dark',
            backgroundScssVar: '#212433',
            deviceBarBackgroundScssVar: '#F5F5F5',
            style: 'DARK',
          }
        : {
            name: 'apricot',
            backgroundScssVar: '#f4f5f8',
            deviceBarBackgroundScssVar: '#f5f5f5',
            style: 'LIGHT',
          });
    this.set(
      themes.map((t) => {
        return { ...t, active: t.name === activeTheme.name };
      })
    );
    this.setTheme(activeTheme);
  }

  setTheme(themeName: ThemeDefinition): void {
    const classesToRemove = this.store.filter((f) => f.name !== themeName.name).map((m) => m.name);
    document.body.classList.remove(...classesToRemove);
    document.body.classList.add(themeName.name);
    this.appStateServ.setAppSettings({ theme: themeName });
  }

  isPrefersDark(): boolean {
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  }
}
