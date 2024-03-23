import { Animation } from '@ionic/angular';
import { CustomAnimation } from '../abstracts/custom-animation.abstract';

export class BoardRestartAnimation extends CustomAnimation {
  protected override createAnimation(): Animation {
    return this.create()
      .addElement(this.elementRef)
      .fill('none')
      .duration(350)
      .keyframes([
        { offset: 0.0, transform: 'rotate(0.0turn) scale(1.0)', filter: 'blur(0px)' },
        { offset: 0.1, transform: 'rotate(0.1turn) scale(0.9)', filter: 'blur(1.5px)' },
        { offset: 0.2, transform: 'rotate(0.2turn) scale(0.8)', filter: 'blur(2.5px)' },
        { offset: 0.3, transform: 'rotate(0.3turn) scale(0.7)', filter: 'blur(3.5px)' },
        { offset: 0.4, transform: 'rotate(0.4turn) scale(0.6)', filter: 'blur(4.5px)' },
        { offset: 0.5, transform: 'rotate(0.5turn) scale(0.5)', filter: 'blur(5px)' },
        { offset: 0.6, transform: 'rotate(0.6turn) scale(0.6)', filter: 'blur(4.5px)' },
        { offset: 0.7, transform: 'rotate(0.7turn) scale(0.7)', filter: 'blur(3.5px)' },
        { offset: 0.8, transform: 'rotate(0.8turn) scale(0.8)', filter: 'blur(2.5px)' },
        { offset: 0.9, transform: 'rotate(0.9turn) scale(0.9)', filter: 'blur(1.5px)' },
        { offset: 1.0, transform: 'rotate(1.0turn) scale(1.0)', filter: 'blur(0px)' },
      ]);
  }
}
