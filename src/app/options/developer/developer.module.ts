import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { DeveloperPageRoutingModule } from './developer-routing.module';

import { DeveloperPage } from './developer.page';
import { SharedModule } from 'src/app/shared/shared.module';

@NgModule({
  imports: [CommonModule, FormsModule, IonicModule, DeveloperPageRoutingModule, SharedModule],
  declarations: [DeveloperPage],
})
export class DeveloperPageModule {}
