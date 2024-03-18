import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HeaderComponent } from 'src/app/shared/components/header/header.component';
import { IonicModule } from '@ionic/angular';
import { NumberButtonComponent } from './components/number-button/number-button.component';
import { FirstUpperPipe } from './pipes/first-upper.pipe';
import { BannerComponent } from './components/banner/banner.component';
import { FullscreenViewComponent } from './components/fullscreen-view/fullscreen-view.component';

@NgModule({
  declarations: [HeaderComponent, NumberButtonComponent, BannerComponent, FullscreenViewComponent, FirstUpperPipe],
  imports: [CommonModule, IonicModule],
  exports: [HeaderComponent, NumberButtonComponent, BannerComponent, FullscreenViewComponent, FirstUpperPipe],
})
export class SharedModule {}
