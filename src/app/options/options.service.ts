import { Injectable } from '@angular/core';
import { Option, ToggleOption } from './options.types';
import { Menu } from '../shared/abstracts/menu.abstract';
import { StorageService } from '../shared/services/storage.service';

@Injectable({
  providedIn: 'root',
})
export class OptionsService extends Menu<Option> {
  protected override readonly storageKey = `SUDOKU_GAME_OPTIONS`;
  protected override _entityName = 'OPTIONS';

  private _options: Option[] = [
    {
      id: ToggleOption.DONT_HIDE_NUMBER_BUTTONS,
      title: `Don't hide number buttons`,
      defaultValue: true,
      value: true,
      display: true,
    },
    {
      id: ToggleOption.FIELD_ANIMATIONS,
      title: `Field animations`,
      defaultValue: true,
      value: true,
      display: true,
    },
    {
      id: ToggleOption.BOARD_ANIMATIONS,
      title: `Board animations`,
      defaultValue: true,
      value: true,
      display: true,
    },
    {
      id: ToggleOption.CLICK_BACKDROP_TO_UNPAUSE,
      title: `Click backdrop to unpause`,
      defaultValue: false,
      value: false,
      display: true,
    },
    {
      id: ToggleOption.UNLIMITTED_MISTAKES,
      title: `Unlimitted mistakes`,
      description: 'Default limit is 3',
      defaultValue: false,
      value: false,
      display: true,
    },
    {
      id: ToggleOption.SOUND,
      title: `Sound`,
      defaultValue: true,
      value: true,
      display: true,
    },
    { id: ToggleOption.HAPTICS, title: 'Haptics', defaultValue: true, value: true, display: true },
    { id: ToggleOption.SHOW_DIFFICULTY, title: 'Show difficulty', defaultValue: true, value: true, display: true },
    { id: ToggleOption.SHOW_TIMER, title: 'Show timer', defaultValue: true, value: true, display: true },
    { id: ToggleOption.SHOW_SCORE, title: 'Show score', defaultValue: true, value: true, display: true },
    { id: ToggleOption.SHOW_MISTAKES, title: 'Show mistakes', defaultValue: true, value: true, display: true },
  ];

  get options() {
    return this._options;
  }

  constructor(protected override readonly storageServ: StorageService) {
    super(storageServ);
  }

  async register(): Promise<void> {
    const loadedOptions = await this.load();
    if (loadedOptions.length > 0) {
      const optStr = loadedOptions.map((item) => item.title).join('') + loadedOptions.map((item) => item.description);
      const currentOptStr =
        this.options.map((item) => item.title).join('') + this.options.map((item) => item.description);

      if (optStr !== currentOptStr) {
        console.info("%c [SudokuClick][Options] Option checksum is different. I'll rewrite db.", 'color:yellow');
        this.save(this.options);
      } else {
        console.info("%c [SudokuClick][Options] Option checksum is ok. I'll load options from db.", 'color:green');
        this._options = loadedOptions;
      }
    } else {
      console.info("%c [SudokuClick][Options] Options not exists. I'll write to db.", 'color:yellow');
      await this.save(this._options);
    }
  }

  toggleOption(id: number): void {
    this.options.forEach((item, index) => {
      if (index === id) {
        this._options[index].value = !this._options[index].value;
      }
    });
  }

  getValueById(id: ToggleOption): boolean {
    return this._options.find((item) => item.id == id)?.value ?? false;
  }
}
