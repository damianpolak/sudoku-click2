import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HeaderComponent } from 'src/app/shared/components/header/header.component';
import { IonicModule } from '@ionic/angular';
import { NumberButtonComponent } from './components/number-button/number-button.component';

@NgModule({
  declarations: [HeaderComponent, NumberButtonComponent],
  imports: [CommonModule, IonicModule],
  exports: [HeaderComponent, NumberButtonComponent],
})
export class SharedModule {}
