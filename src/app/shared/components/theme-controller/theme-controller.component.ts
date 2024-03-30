import { Component, OnDestroy, OnInit } from '@angular/core';

@Component({
  selector: 'app-theme-controller',
  templateUrl: './theme-controller.component.html',
  styleUrls: ['./theme-controller.component.scss'],
})
export class ThemeControllerComponent implements OnInit, OnDestroy {
  constructor() {}

  ngOnInit() {
    console.log('ThemeController init');
  }

  ngOnDestroy(): void {
    console.log('ThemeController Destroy');
  }
}
