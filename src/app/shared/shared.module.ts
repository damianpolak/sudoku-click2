import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HeaderComponent } from 'src/app/shared/components/header/header.component';
import { IonicModule } from '@ionic/angular';
import { NumberButtonComponent } from './components/number-button/number-button.component';
import { FirstUpperPipe } from './pipes/first-upper.pipe';

@NgModule({
  declarations: [HeaderComponent, NumberButtonComponent, FirstUpperPipe],
  imports: [CommonModule, IonicModule],
  exports: [HeaderComponent, NumberButtonComponent, FirstUpperPipe],
})
export class SharedModule {}
