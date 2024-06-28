import { KeyName } from '../interfaces/core.interface';
import { StorageService } from '../services/storage.service';
import { BaseService } from './base-service.abstract';

interface BaseMenu {
  save(value: unknown): Promise<void>;
  load(): Promise<unknown[]>;
  entityName: string;
}

export abstract class Menu<T> extends BaseService implements BaseMenu {
  protected abstract readonly storageKey: KeyName;
  protected abstract readonly _entityName: string;

  get entityName(): string {
    return this._entityName.toLowerCase();
  }

  constructor(protected readonly storageServ: StorageService) {
    super();
  }

  async save(value: T | T[]): Promise<void> {
    try {
      await this.storageServ.set(this.storageKey, [
        ...(Array.isArray(value) ? [] : await this.load()),
        ...(Array.isArray(value) ? value : [value]),
      ]);
    } catch (e) {
      console.error(`Cannot save ${this.entityName}`);
    }
  }

  async load(): Promise<T[]> {
    try {
      const data = await this.storageServ.get(this.storageKey);
      return (data ? data : []) as T[];
    } catch (e) {
      console.error(`An error occured when trying to load ${this.entityName}`);
      return [];
    }
  }
}
