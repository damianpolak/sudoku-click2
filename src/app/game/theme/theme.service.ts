import { Injectable } from '@angular/core';
import { ServiceStore } from 'src/app/shared/abstracts/service-store.abstract';

type Theme = string;
export type ThemeDefinition = {
  name: Theme;
  active?: boolean;
  background: string;
};

@Injectable({
  providedIn: 'root',
})
export class ThemeService extends ServiceStore<ThemeDefinition> {
  private readonly autoThemeMode: boolean = false;

  constructor() {
    super();
  }

  register(themes: ThemeDefinition[], active?: Theme): void {
    const isPrefersDark = this.isPrefersDark();
    const activeTheme = active || (isPrefersDark ? 'dark' : 'light');
    this.set(
      themes.map((t) => {
        return { ...t, active: t.name === activeTheme };
      })
    );
    this.setTheme(activeTheme);
  }

  setTheme(themeName: Theme): void {
    const classesToRemove = this.store.filter((f) => f.name !== themeName).map((m) => m.name);
    document.body.classList.remove(...classesToRemove);
    document.body.classList.add(themeName);
  }

  isPrefersDark(): boolean {
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  }
}
