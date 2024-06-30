import { Injectable } from '@angular/core';
import { Effect } from '../../abstracts/effect.abstract';

@Injectable({
  providedIn: 'root',
})
export class SfxService extends Effect<HTMLAudioElement, string> {
  constructor() {
    super();
    this.register([
      { name: 'click', resource: 'assets/sfx/click.mp3' },
      { name: 'mistake', resource: 'assets/sfx/mistake.mp3' },
      { name: 'zipclick', resource: 'assets/sfx/zipclick.mp3' },
    ]);

    this.loadAudio();
  }

  private loadAudio(): void {
    if (this.effectResource.length === 0) {
      throw new Error('No audio resources found');
    }

    this.resource = this.effectResource.map((i) => {
      return new Audio(i.resource);
    });

    this.resource.forEach((audioItem) => {
      audioItem.load();
    });

    this.loaded = true;
  }

  protected async effectBody(name: string): Promise<void> {
    const audio = this.resource.find((i) => i.src.includes(name));

    if (audio) {
      await audio.play();
    }
  }
}
