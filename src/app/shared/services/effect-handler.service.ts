import { Injectable, OnDestroy } from '@angular/core';
import { GameStateService } from './game-state.service';
import { combineLatest, concat, delay, exhaustAll, expand, first, merge, of, race, repeat, take, tap } from 'rxjs';
import { BaseService } from '../abstracts/base-service.abstract';
import { SfxService } from './effects/sfx.service';
import { OptionsService } from 'src/app/options/options.service';
import { ToggleOption } from 'src/app/options/options.types';
import { ControlsService } from 'src/app/game/controls/controls.service';
import { AppStateService } from './app-state.service';
import { HapticService } from './effects/haptic.service';

@Injectable({
  providedIn: 'root',
})
export class EffectHandlerService extends BaseService implements OnDestroy {
  private readonly boardFieldClickSub$ = this.gameStateServ
    .getBoardFieldClick$()
    .pipe(tap(() => this.onFieldClick()))
    .subscribe();

  private readonly featureClickSub$ = combineLatest([this.controlsServ.getFeatureClick$()])
    .pipe(tap(() => this.onFeatureClick()))
    .subscribe();

  private readonly numberClickSub$ = combineLatest([this.controlsServ.getNumberClick$()])
    .pipe(tap(() => this.onNumberClick()))
    .subscribe();

  private uiButtonClickSub$ = merge(
    this.appStateServ.getOptionButtonClick$(),
    this.appStateServ.getHeaderButtonClick$(),
    this.appStateServ.getMainMenuButtonClick$()
  )
    .pipe(
      tap(() => {
        this.onUIButtonClick();
      })
    )
    .subscribe();

  constructor(
    private readonly appStateServ: AppStateService,
    private readonly gameStateServ: GameStateService,
    private readonly controlsServ: ControlsService,
    private readonly optionsService: OptionsService,
    private readonly sfxServ: SfxService,
    private readonly hapticServ: HapticService
  ) {
    super();
    this.registerSubscriptions([
      this.boardFieldClickSub$,
      this.featureClickSub$,
      this.numberClickSub$,
      this.uiButtonClickSub$,
    ]);
  }

  ngOnDestroy(): void {
    this.unsubscribeSubscriptions();
  }

  private onFieldClick(): void {
    if (this.optionsService.getValueById(ToggleOption.SOUND)) {
      // ...
    }
  }

  private onFeatureClick(): void {
    if (this.optionsService.getValueById(ToggleOption.SOUND)) {
      this.sfxServ.run('zipclick');
      this.hapticServ.run('impactLight');
    }
  }

  private onNumberClick(): void {
    if (this.optionsService.getValueById(ToggleOption.SOUND)) {
      this.sfxServ.run('click');
      this.hapticServ.run('impactLight');
    }
  }

  private onUIButtonClick(): void {
    if (this.optionsService.getValueById(ToggleOption.SOUND)) {
      this.sfxServ.run('zipclick');
    }
  }
}
