import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { NavController } from '@ionic/angular';
import { AppStateService } from '../../services/app-state.service';
import { BaseComponent } from '../../abstracts/base-component.abstract';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
})
export class HeaderComponent extends BaseComponent implements OnInit, OnDestroy {
  @Input() showOptions: boolean = true;
  @Input() showThemes: boolean = false;
  @Input() showPause: boolean = false;
  @Input() showBack: boolean = false;
  @Input() backPath: string = '';
  @Input() title: string = '';

  @Output() pauseClickEvent = new EventEmitter<boolean>();
  @Output() themeClickEvent = new EventEmitter<boolean>();
  @Output() optionsClickEvent = new EventEmitter<boolean>();
  @Output() backClickEvent = new EventEmitter<void>();

  @Input() isPaused: boolean = false;
  @Input() isThemesMenuVisible: boolean = false;
  isOptionsMenuVisible: boolean = false;
  private appDevMode: boolean = false;

  private readonly appDevModeSub$ = this.appStateServ.getAppDevMode$().subscribe((v) => (this.appDevMode = v));
  constructor(private navCtrl: NavController, private appStateServ: AppStateService) {
    super();
    this.registerSubscriptions([this.appDevModeSub$]);
  }

  ngOnInit(): void {
    console.log('Header on init');
  }

  ngOnDestroy(): void {
    this.unsubscribeSubscriptions();
  }

  onBack(): void {
    if (this.showBack && this.backPath !== '') {
      this.navCtrl.navigateBack(this.backPath);
      this.backClickEvent.emit();
    }
  }

  onPause(): void {
    this.isPaused = !this.isPaused;
    this.pauseClickEvent.emit(this.isPaused);
  }

  onThemes(): void {
    this.isThemesMenuVisible = !this.isThemesMenuVisible;
    this.themeClickEvent.emit(this.isThemesMenuVisible);
  }

  onOptions(): void {
    this.isOptionsMenuVisible = !this.isOptionsMenuVisible;
    this.optionsClickEvent.emit(this.isOptionsMenuVisible);
  }

  onAppDevModeToggle(): void {
    this.appStateServ.setAppDevMode(!this.appDevMode);
  }
}
