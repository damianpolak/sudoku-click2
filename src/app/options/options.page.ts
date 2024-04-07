import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { NavController } from '@ionic/angular';

@Component({
  selector: 'app-options',
  templateUrl: './options.page.html',
  styleUrls: ['./options.page.scss'],
})
export class OptionsPage implements OnInit {
  constructor(private route: ActivatedRoute, private readonly navCtrl: NavController) {}
  backPath!: string;
  async ngOnInit(): Promise<void> {
    this.route.queryParams.subscribe((params) => {
      this.backPath = params['parent'] ? params['parent'] : '/home';
    });
  }

  async onMenuItemClick(): Promise<void> {
    await this.navCtrl.navigateForward('options/stats', { queryParams: { parent: 'options' } });
  }
}
