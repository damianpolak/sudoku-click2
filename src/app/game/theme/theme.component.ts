import { Component, OnInit } from '@angular/core';
import { DynamicModalComponent } from 'src/app/shared/abstracts/modal.abstract';
import { ThemeModalActionType } from './theme.types';

@Component({
  selector: 'app-theme',
  templateUrl: './theme.component.html',
  styleUrls: ['./theme.component.scss'],
})
export class ThemeComponent extends DynamicModalComponent<ThemeModalActionType> implements OnInit {
  constructor() {
    super();
  }

  // eslint-disable-next-line @angular-eslint/no-empty-lifecycle-method
  ngOnInit() {}
}
