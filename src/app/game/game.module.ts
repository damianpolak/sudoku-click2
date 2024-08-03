import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { GamePageRoutingModule } from './game-routing.module';

import { GamePage } from './game.page';
import { SharedModule } from '../shared/shared.module';
import { StatusBarComponent } from './status-bar/status-bar.component';
import { BoardComponent } from './board/board.component';
import { FieldComponent } from './board/field/field.component';
import { ControlsComponent } from './controls/controls.component';
import { PauseComponent } from './pause/pause.component';
import { DebugModeDirective } from '../shared/directives/debug-mode.directive';
import { ThemeComponent } from './theme/theme.component';

@NgModule({
  imports: [CommonModule, FormsModule, IonicModule, SharedModule, GamePageRoutingModule],
  declarations: [
    GamePage,
    StatusBarComponent,
    BoardComponent,
    FieldComponent,
    ControlsComponent,
    PauseComponent,
    ThemeComponent,
    DebugModeDirective,
  ],
})
export class GamePageModule {}
