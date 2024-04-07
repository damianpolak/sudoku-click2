import { BaseClass } from './base-class.abstract';

export abstract class BaseComponent extends BaseClass {
  protected isReady: boolean = false;
  constructor() {
    super();
  }
}
