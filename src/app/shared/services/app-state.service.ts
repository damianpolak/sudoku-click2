import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, ReplaySubject, Subject, map } from 'rxjs';
import { AppSettings, BasicOrientationType } from './app-state.types';
import { ConversionUtil } from '../utils/conversion.util';
import { StorageService } from './storage.service';

@Injectable({
  providedIn: 'root',
})
export class AppStateService {
  private static readonly APP_SETTINGS_KEY = 'SUDOKU_APP_SETTINGS' as const;
  private readonly screenOrientation$ = new ReplaySubject<OrientationType>(5);
  private readonly appDevMode$ = new BehaviorSubject<boolean>(false);
  private readonly appSettings$ = new Subject<AppSettings>();

  constructor(private readonly storageServ: StorageService) {}

  setScreenOrientation(orientation: OrientationType): void {
    this.screenOrientation$.next(orientation);
  }

  getScreenOrientation$(): Observable<BasicOrientationType> {
    return this.screenOrientation$.pipe(
      map((i) => {
        return ConversionUtil.basicOrientationType(i);
      })
    );
  }

  getAppDevMode$(): Observable<boolean> {
    return this.appDevMode$.asObservable();
  }

  setAppDevMode(value: boolean): void {
    this.appDevMode$.next(value);
  }

  async storageInit(): Promise<void> {
    await this.storageServ.init();
  }

  async loadStorageSettings(): Promise<AppSettings | undefined> {
    return await this.storageServ.get(AppStateService.APP_SETTINGS_KEY);
  }

  async setAppSettings(appSettings: AppSettings): Promise<void> {
    const settings = await this.storageServ.get(AppStateService.APP_SETTINGS_KEY);
    console.log('=== settings', settings);
    this.appSettings$.next(appSettings);
  }

  async saveAppSettings(appSettings: AppSettings): Promise<void> {
    await this.storageServ.set(AppStateService.APP_SETTINGS_KEY, appSettings);
  }

  getAppSettings$(): Observable<AppSettings> {
    return this.appSettings$.asObservable();
  }
}
