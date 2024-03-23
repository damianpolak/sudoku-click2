import { Animation } from '@ionic/angular';
import { CustomAnimation } from '../abstracts/custom-animation.abstract';

export class BannerAnimation extends CustomAnimation {
  protected override createAnimation(): Animation {
    return this.create()
      .addElement(this.elementRef)
      .fill('none')
      .duration(this.params.duration)
      .fromTo('transform', 'scale(0)', 'scale(1)')
      .delay(1000)
      .keyframes([
        { offset: 0.0, opacity: '1.0' },
        { offset: 0.5, opacity: '0.5' },
        { offset: 1.0, opacity: '0.0' },
      ]);
  }
}
