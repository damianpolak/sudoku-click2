import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { NavController } from '@ionic/angular';

@Component({
  selector: 'app-stats',
  templateUrl: './stats.page.html',
  styleUrls: ['./stats.page.scss'],
})
export class StatsPage implements OnInit {
  backPath!: string;

  constructor(private route: ActivatedRoute, private readonly navCtrl: NavController) {}

  async ngOnInit(): Promise<void> {
    this.route.queryParams.subscribe((params) => {
      this.backPath = params['parent'] ? params['parent'] : '/home';
    });
  }
}
