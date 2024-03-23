import { Animation } from '@ionic/angular';
import { CustomAnimation } from '../abstracts/custom-animation.abstract';

export class BoardStartAnimation extends CustomAnimation {
  protected override createAnimation(): Animation {
    return this.create()
      .addElement(this.elementRef)
      .fill('none')
      .delay(200)
      .duration(350)
      .afterStyles({ transform: 'scale(1)' })
      .keyframes([
        { offset: 0.0, transform: 'scale(0.0) rotate(0.0turn)', filter: 'blur(0px)' },
        { offset: 0.1, transform: 'scale(0.1) rotate(0.1turn)', filter: 'blur(1.5px)' },
        { offset: 0.2, transform: 'scale(0.2) rotate(0.2turn)', filter: 'blur(2.5px)' },
        { offset: 0.3, transform: 'scale(0.3) rotate(0.3turn)', filter: 'blur(3.5px)' },
        { offset: 0.4, transform: 'scale(0.4) rotate(0.4turn)', filter: 'blur(4.5px)' },
        { offset: 0.5, transform: 'scale(0.5) rotate(0.5turn)', filter: 'blur(5px)' },
        { offset: 0.6, transform: 'scale(0.6) rotate(0.6turn)', filter: 'blur(4.5px)' },
        { offset: 0.7, transform: 'scale(0.7) rotate(0.7turn)', filter: 'blur(3.5px)' },
        { offset: 0.8, transform: 'scale(0.8) rotate(0.8turn)', filter: 'blur(2.5px)' },
        { offset: 0.9, transform: 'scale(0.9) rotate(0.9turn)', filter: 'blur(1.5px)' },
        { offset: 1.0, transform: 'scale(1.0) rotate(1.0turn)', filter: 'blur(0px)' },
      ]);
  }
}
