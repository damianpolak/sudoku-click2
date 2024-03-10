import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { NavController } from '@ionic/angular';
import { GameStateService } from '../../services/game-state.service';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
})
export class HeaderComponent implements OnInit {

  @Input() showOptions: boolean = true;
  @Input() showPause: boolean = false;
  @Input() showBack: boolean = false;
  @Input() backPath: string = '';
  @Input() title: string = '';

  @Output() pauseClickEvent = new EventEmitter<boolean>();
  @Output() optionsClickEvent = new EventEmitter<boolean>();
  @Output() backClickEvent = new EventEmitter<void>();

  @Input() isPaused: boolean = false;
  isOptionsMenuVisible: boolean = false;

  constructor(private navCtrl: NavController, private gameStateServ: GameStateService) { }
  ngOnInit(): void {
    console.log('Header on init');
  }

  onBack(): void {
    if(this.showBack && this.backPath !== '') {
      this.navCtrl.navigateBack(this.backPath);
      this.backClickEvent.emit();
    }
  }

  onPause(): void {
    this.isPaused = !this.isPaused;
    this.pauseClickEvent.emit(this.isPaused);
  }

  onOptions(): void {
    this.isOptionsMenuVisible = !this.isOptionsMenuVisible;
    this.optionsClickEvent.emit(this.isOptionsMenuVisible);
  }
}
