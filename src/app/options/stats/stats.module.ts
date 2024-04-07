import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';
import { SharedModule } from '../../shared/shared.module';
import { StatsPageRoutingModule } from './stats-routing.module';

import { StatsPage } from './stats.page';

@NgModule({
  imports: [CommonModule, FormsModule, IonicModule, StatsPageRoutingModule, SharedModule],
  declarations: [StatsPage],
})
export class StatsPageModule {}
