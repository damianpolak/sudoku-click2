import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';
import { isNavigatedGuard } from './guards';

const routes: Routes = [
  {
    path: 'home',
    loadChildren: () => import('./home/home.module').then((m) => m.HomePageModule),
  },
  {
    path: '',
    redirectTo: 'home',
    pathMatch: 'full',
  },
  {
    path: 'game',
    loadChildren: () => import('./game/game.module').then((m) => m.GamePageModule),
    pathMatch: 'full',
    canActivate: [isNavigatedGuard],
  },
  {
    path: 'options',
    loadChildren: () => import('./options/options.module').then((m) => m.OptionsPageModule),
    pathMatch: 'full',
    canActivate: [isNavigatedGuard],
  },
  {
    path: 'options/stats',
    loadChildren: () => import('./options/stats/stats.module').then((m) => m.StatsPageModule),
    pathMatch: 'full',
    canActivate: [isNavigatedGuard],
  },
  {
    path: 'options/developer',
    loadChildren: () => import('./options/developer/developer.module').then((m) => m.DeveloperPageModule),
    pathMatch: 'full',
    canActivate: [isNavigatedGuard],
  },
  {
    path: '**',
    redirectTo: 'home',
  },
];

@NgModule({
  imports: [RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules })],
  exports: [RouterModule],
})
export class AppRoutingModule {}
