import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, ReplaySubject, Subject, map } from 'rxjs';
import { AppSettings, BasicOrientationType } from './app-state.types';
import { ConversionUtil } from '../utils/conversion.util';
import { StorageService } from './storage.service';
import { HttpClient } from '@angular/common/http';
import { Build } from '../interfaces/core.interface';

@Injectable({
  providedIn: 'root',
})
export class AppStateService {
  private static readonly APP_SETTINGS_KEY = 'SUDOKU_APP_SETTINGS' as const;
  private readonly screenOrientation$ = new ReplaySubject<OrientationType>(5);
  private readonly appDebugMode$ = new BehaviorSubject<boolean>(false);
  private readonly appDevMode$ = new ReplaySubject<boolean>();
  private readonly appSettings$ = new Subject<AppSettings>();

  private readonly headerButtonClick$ = new Subject<void>();
  private readonly optionButtonClick$ = new Subject<void>();
  private readonly mainMenuButtonClick$ = new Subject<void>();
  private readonly buildVersionFile$ = (this.httpClient.get('build-version.json') as unknown as Observable<Build>).pipe(
    map((v) => {
      return v ? v : ({ appVersion: 'no info', iterationNumber: 0, buildVersion: 'no info' } as Build);
    })
  );

  constructor(private readonly storageServ: StorageService, private readonly httpClient: HttpClient) {}

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

  getAppDebugMode$(): Observable<boolean> {
    return this.appDebugMode$.asObservable();
  }

  setAppDebugMode(value: boolean): void {
    this.appDebugMode$.next(value);
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

  getAppSettings$(): Observable<AppSettings> {
    return this.appSettings$.asObservable();
  }

  async setAppSettings(appSettings: Partial<AppSettings>): Promise<void> {
    const settings = await this.storageServ.get(AppStateService.APP_SETTINGS_KEY);
    this.appSettings$.next({ ...settings, ...appSettings });
  }

  async saveAppSettings(appSettings: AppSettings): Promise<void> {
    await this.storageServ.set(AppStateService.APP_SETTINGS_KEY, appSettings);
  }

  onHeaderButtonClick(): void {
    this.headerButtonClick$.next();
  }

  getHeaderButtonClick$() {
    return this.headerButtonClick$.asObservable();
  }

  onOptionButtonClick(): void {
    this.optionButtonClick$.next();
  }

  getOptionButtonClick$() {
    return this.optionButtonClick$.asObservable();
  }

  onMainMenuButtonClick(): void {
    this.mainMenuButtonClick$.next();
  }

  getMainMenuButtonClick$() {
    return this.mainMenuButtonClick$.asObservable();
  }

  getBuildVersionFile$() {
    return this.buildVersionFile$;
  }
}
