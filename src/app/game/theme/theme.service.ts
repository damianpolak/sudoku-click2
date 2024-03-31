import { Injectable } from '@angular/core';
import { ServiceStore } from 'src/app/shared/abstracts/service-store.abstract';

type Theme = string;
export type ThemeDefinition = {
  name: Theme;
  active: boolean;
  background?: string;
};

@Injectable({
  providedIn: 'root',
})
export class ThemeService extends ServiceStore<ThemeDefinition> {
  constructor() {
    super();
  }

  register(themes: ThemeDefinition[]): void {
    themes.forEach((f) => {
      if (!this.store.map((s) => s.name).includes(f.name)) {
        this.add([f]);
      }
    });
  }

  setTheme(themeName: Theme): void {
    console.log('=== setTheme ===', themeName);
    // document.body.classList.toggle(themeName, true);
    let a = this.store.filter((f) => f.name !== themeName).map((m) => m.name);
    console.log('=== to remove', a);
    document.body.classList.remove(...a);
    document.body.classList.add(themeName);
  }
}
