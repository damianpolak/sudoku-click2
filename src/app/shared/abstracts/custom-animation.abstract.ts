import { Animation, AnimationController } from '@ionic/angular';

export type AnimationElement = Element | Element[] | Node | Node[] | NodeList;
export interface AnimationParams extends Record<string, any> {
  duration?: number;
  beforeAddClass?: string | string[];
}

export abstract class CustomAnimation extends AnimationController {
  protected elementRef: AnimationElement;
  protected params: Partial<AnimationParams>;

  constructor(element: AnimationElement, params: AnimationParams = {}) {
    super();
    this.elementRef = element;
    this.params = params;
  }

  protected abstract createAnimation(): Animation;

  getAnimation(): Animation {
    return this.createAnimation();
  }
}
