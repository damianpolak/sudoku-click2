import { Component, OnInit } from '@angular/core';
import { DynamicModalComponent } from 'src/app/shared/abstracts/modal.abstract';
import { ThemeModalActionType } from './theme.types';
import { ThemeDefinition, ThemeService } from './theme.service';
import { Observable, Subscription, find, from, lastValueFrom, map, take } from 'rxjs';
import { AppStateService } from 'src/app/shared/services/app-state.service';

@Component({
  selector: 'app-theme',
  templateUrl: './theme.component.html',
  styleUrls: ['./theme.component.scss'],
})
export class ThemeComponent extends DynamicModalComponent<ThemeModalActionType> {
  override backdropDismissEnabled: boolean = true;
  private _themes: ThemeDefinition[] = [];
  private themesSub$: Subscription = this.themeServ.get$().subscribe((v) => {
    this._themes = v;
  });

  get themes(): ThemeDefinition[] {
    return this._themes;
  }

  constructor(private readonly themeServ: ThemeService, private readonly appStateServ: AppStateService) {
    super();
    this.registerSubscriptions([this.themesSub$]);
  }

  async onThemeClick(themeName: string): Promise<void> {
    this.appStateServ.onOptionButtonClick();
    this.themeServ.set(
      this.themes.map((t) => ({
        ...t,
        active: t.name === themeName,
      }))
    );
    this.themeServ
      .get$()
      .pipe(
        take(1),
        map((v) => v.find((f) => f.name === themeName))
      )
      .subscribe((v) => this.themeServ.setTheme(v as ThemeDefinition));
  }

  getThemeStyle(themeName: string): Record<string, string> {
    const themeDef = this.themes.find((t) => t.name === themeName);
    return {
      '--background': themeDef?.backgroundScssVar ? `var(${themeDef?.backgroundScssVar})` : '',
      '--border-width': themeDef?.active ? '0.2rem' : '0.1rem',
      '--border-style': 'solid',
      '--border-color': themeDef?.active ? 'var(--ion-color-primary)' : 'rgba(var(--ion-color-primary-rgb), .2)',
      '--box-shadow': 'none',
    };
  }
}
