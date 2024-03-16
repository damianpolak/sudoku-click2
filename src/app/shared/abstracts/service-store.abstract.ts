import { BehaviorSubject, Observable, Subscription } from 'rxjs';

interface Store {
  add(items: unknown[]): void;
  clear(): void;
  get$(): Observable<unknown[]>;
  create(): void;
  destroy(): void;
}

export abstract class ServiceStore<T> implements Store {
  protected _store: T[] = [];
  protected readonly emitter$: BehaviorSubject<T[]> = new BehaviorSubject<T[]>([]);
  protected storeSub$!: Subscription;
  protected get store() {
    return this._store;
  }

  add(items: T[]): void {
    this.emitter$.next([...this._store, ...items]);
  }

  clear(): void {
    this.emitter$.next([]);
  }

  get$(): Observable<T[]> {
    return this.emitter$.asObservable();
  }

  create(): void {
    if (!this.storeSub$ || this.storeSub$.closed) {
      this.storeSub$ = this.emitter$.subscribe((v) => {
        this._store = v;
      });
    }
  }

  destroy(): void {
    this._store = [];
    this.storeSub$.unsubscribe();
  }
}
