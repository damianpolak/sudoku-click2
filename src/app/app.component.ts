import { Component } from '@angular/core';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
})
export class AppComponent {
  private readonly autoThemeMode: boolean = false;
  
  constructor() {
    this.themeToggler();
  }

  private themeToggler(): void {
    if (this.autoThemeMode) {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)');
      if (prefersDark.matches) {
        this.setTheme('dark');
      } else {
        this.setTheme('light');
      }
    } else {
      this.setTheme('dark');
    }
  }

  private setTheme(theme: 'light' | 'dark'): void {
    document.body.classList.toggle(theme, true);
  }
}
