import { Animation } from '@ionic/angular';
import { CustomAnimation } from '../abstracts/custom-animation.abstract';

export class NumberButtonAnimation extends CustomAnimation {
  protected override createAnimation(): Animation {
    return this.create()
      .fill('none')
      .addElement(this.elementRef)
      .duration(250)
      .easing('ease-out')
      .keyframes([
        { offset: 0.0, transform: 'scale(1.00)', 'z-index': '10' },
        { offset: 0.5, transform: 'scale(1.15)', 'z-index': '10' },
        { offset: 1.0, transform: 'scale(1.00)', 'z-index': '10' },
      ]);
  }
}
