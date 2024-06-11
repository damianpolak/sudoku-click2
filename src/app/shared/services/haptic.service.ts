import { Injectable } from '@angular/core';
import { Effect } from '../abstracts/effect.abstract';
import { Haptics, HapticsPlugin, ImpactOptions, ImpactStyle } from '@capacitor/haptics';

class HapticsPluginWrapper {
  private _impactOption!: ImpactOptions;
  private _name!: string;

  get impactOption() {
    return this._impactOption;
  }

  get name(): string {
    return this._name;
  }

  load(name: string, option: ImpactOptions): this {
    this._impactOption = option;
    this._name = name;
    return this;
  }

  async impact(): Promise<void> {
    await Haptics.impact(this._impactOption);
  }
}

@Injectable({
  providedIn: 'root',
})
export class HapticService extends Effect<HapticsPluginWrapper, ImpactOptions> {
  constructor() {
    super();
    this.register([
      { name: 'impactLight', resource: { style: ImpactStyle.Light } },
      { name: 'impactMedium', resource: { style: ImpactStyle.Medium } },
      { name: 'impactHeavy', resource: { style: ImpactStyle.Heavy } },
    ]);

    this.loadHaptics();
  }

  private loadHaptics(): void {
    if (this.effectResource.length === 0) {
      throw new Error('No haptic resources found');
    }

    this.resource = this.effectResource.map((i) => {
      return new HapticsPluginWrapper().load(i.name, i.resource);
    });

    this.loaded = true;
  }

  protected async effectBody(name: string): Promise<void> {
    const haptic = this.resource.find((i) => i.name === name);
    if (haptic) {
      await haptic.impact();
    }
  }
}
