import { Animation } from '@ionic/angular';
import { CustomAnimation } from '../abstracts/custom-animation.abstract';

export class BoardSecondChanceAnimation extends CustomAnimation {
  protected override createAnimation(): Animation {
    return this.create()
      .addElement(this.elementRef)
      .fill('none')
      .duration(550)
      .keyframes([
        { offset: 0.0, filter: 'blur(0px)' },
        { offset: 0.1, filter: 'blur(1.5px)' },
        { offset: 0.2, filter: 'blur(2.5px)' },
        { offset: 0.3, filter: 'blur(3.5px)' },
        { offset: 0.4, filter: 'blur(4.5px)' },
        { offset: 0.5, filter: 'blur(5px)' },
        { offset: 0.6, filter: 'blur(4.5px)' },
        { offset: 0.7, filter: 'blur(3.5px)' },
        { offset: 0.8, filter: 'blur(2.5px)' },
        { offset: 0.9, filter: 'blur(1.5px)' },
        { offset: 1.0, filter: 'blur(0px)' },
      ]);
  }
}
