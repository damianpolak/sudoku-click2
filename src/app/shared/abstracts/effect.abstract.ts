type EffectType<T> = {
  name: string;
  resource: T;
};
export abstract class Effect<T, K> {
  protected resource: T[] = [];
  protected effectResource: EffectType<K>[] = [];
  protected loaded: boolean = false;
  protected effectEnabled: boolean = true;

  register(resource: EffectType<K>[]): void {
    this.effectResource = [...this.effectResource, ...resource];
  }

  protected abstract effectBody(name: string): Promise<void>;

  protected process(effectBody: () => void) {
    if (this.effectEnabled) {
      if (this.effectResource.length === 0) {
        throw new Error('No resources found');
      }

      if (!this.loaded) {
        throw new Error('Files not loaded');
      }

      effectBody();
    }
  }

  async run(name: string): Promise<void> {
    this.process(async () => {
      await this.effectBody(name);
    });
  }
}
