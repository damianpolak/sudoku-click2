import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { NavController } from '@ionic/angular';
import { OptionsService } from './options.service';
import { Option } from './options.types';
import { AppStateService } from '../shared/services/app-state.service';

@Component({
  selector: 'app-options',
  templateUrl: './options.page.html',
  styleUrls: ['./options.page.scss'],
})
export class OptionsPage implements OnInit {
  backPath!: string;
  private _options: Option[] = [];

  get options(): Option[] {
    return this._options;
  }

  constructor(
    private route: ActivatedRoute,
    private readonly navCtrl: NavController,
    private readonly optionsServ: OptionsService,
    private readonly appStateServ: AppStateService
  ) {
    this._options = this.optionsServ.options;
  }

  async ngOnInit(): Promise<void> {
    this.route.queryParams.subscribe((params) => {
      this.backPath = params['parent'] ? params['parent'] : '/home';
    });
  }

  async onMenuItemClick(): Promise<void> {
    await this.navCtrl.navigateForward('options/stats', { queryParams: { parent: 'options' } });
    this.appStateServ.onOptionButtonClick();
  }

  onToggleChange(event: number): void {
    this.optionsServ.toggleOption(event);
    this.optionsServ.save(this.options);
    this.appStateServ.onOptionButtonClick();
  }
}
