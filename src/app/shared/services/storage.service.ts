import { Injectable } from '@angular/core';
import { Storage } from '@ionic/storage-angular';

type KeyName = `SUDOKU_${string}`;

const REGISTERED_KEYS: KeyName[] = ['SUDOKU_GAME_STATE', 'SUDOKU_APP_SETTINGS', 'SUDOKU_GAME_STATS'];

@Injectable({
  providedIn: 'root',
})
export class StorageService {
  private _storage: Storage | null = null;

  constructor(private storage: Storage) {
    this.init();
  }

  async init() {
    const storage = await this.storage.create();
    this._storage = storage;
  }

  async set(key: KeyName, value: any): Promise<void> {
    this.isKeyRegistered(key);
    await this._storage?.set(key, value);
  }

  async get(key: KeyName): Promise<any> {
    this.isKeyRegistered(key);
    return await this._storage?.get(key);
  }

  async remove(key: KeyName): Promise<any> {
    this.isKeyRegistered(key);
    await this._storage?.remove(key);
  }

  private isKeyRegistered(key: KeyName): true | never {
    if (REGISTERED_KEYS.includes(key)) {
      return true;
    } else {
      throw new Error(`The ${key} key is not registered`);
    }
  }
}
