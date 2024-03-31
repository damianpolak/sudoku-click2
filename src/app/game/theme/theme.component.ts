import { Component, OnInit } from '@angular/core';
import { DynamicModalComponent } from 'src/app/shared/abstracts/modal.abstract';
import { ThemeModalActionType } from './theme.types';
import { ThemeDefinition, ThemeService } from './theme.service';
import { Observable, Subscription, from, lastValueFrom } from 'rxjs';

@Component({
  selector: 'app-theme',
  templateUrl: './theme.component.html',
  styleUrls: ['./theme.component.scss'],
})
export class ThemeComponent extends DynamicModalComponent<ThemeModalActionType> implements OnInit {
  override backdropDismissEnabled: boolean = true;
  get themes2(): Observable<ThemeDefinition[]> {
    return this.themeServ.get$();
  }

  private _themes: ThemeDefinition[] = [];
  private themesSub$: Subscription = this.themeServ.get$().subscribe((v) => {
    this._themes = v;
  });

  get themes(): ThemeDefinition[] {
    return this._themes;
  }

  constructor(private readonly themeServ: ThemeService) {
    super();
    this.themeServ.set([
      { name: 'light', active: true, background: 'var(--ion-theme-light-presentable)' },
      { name: 'dark', active: false, background: 'var(--ion-theme-dark-presentable)' },
      { name: 'pastel', active: false, background: 'var(--ion-theme-pastel-presentable)' },
    ]);
  }

  // eslint-disable-next-line @angular-eslint/no-empty-lifecycle-method
  ngOnInit() {}

  onThemeClick(themeName: string): void {
    this.themeServ.set(
      this.themes.map((t) => {
        return {
          ...t,
          active: t.name === themeName,
        };
      })
    );
    this.themeServ.setTheme(themeName);
  }

  getThemeStyle(themeName: string): Record<string, string> {
    const themeDef = this.themes.find((t) => t.name === themeName);
    return {
      '--background': themeDef?.background || '',
      '--border-width': '0.2rem',
      '--border-style': 'solid',
      '--border-color': themeDef?.active ? 'var(--ion-color-primary)' : 'transparent',
      '--box-shadow': 'none',
    };
  }
}
