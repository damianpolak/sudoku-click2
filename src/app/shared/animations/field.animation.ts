import { Animation } from '@ionic/angular';
import { CustomAnimation } from '../abstracts/custom-animation.abstract';

export class FieldAnimation extends CustomAnimation {
  protected override createAnimation(): Animation {
    // prettier-ignore
    return this.create()
      .addElement(this.elementRef)
      .fill('none')
      .duration(550)
      .keyframes([
        { offset: 0.0, transform: 'scale(1.00)', 'box-sizing': 'border-box', border: `${this.params['borderSize']}px solid ${this.params['isCorrectValue'] === true ? 'var(--ion-field-animate-border)' : 'var(--ion-field-animate-border-wrong)'} `},
        { offset: 0.1, transform: 'scale(1.10)', 'box-sizing': 'border-box', border: `${this.params['borderSize']}px solid ${this.params['isCorrectValue'] === true ? 'var(--ion-field-animate-border)' : 'var(--ion-field-animate-border-wrong)'} `},
        { offset: 0.2, transform: 'scale(1.20)', 'box-sizing': 'border-box', border: `${this.params['borderSize']}px solid ${this.params['isCorrectValue'] === true ? 'var(--ion-field-animate-border)' : 'var(--ion-field-animate-border-wrong)'} `},
        { offset: 0.3, transform: 'scale(1.30)', 'box-sizing': 'border-box', border: `${this.params['borderSize']}px solid ${this.params['isCorrectValue'] === true ? 'var(--ion-field-animate-border)' : 'var(--ion-field-animate-border-wrong)'} `},
        { offset: 0.4, transform: 'scale(1.20)', 'box-sizing': 'border-box', border: `${this.params['borderSize']}px solid ${this.params['isCorrectValue'] === true ? 'var(--ion-field-animate-border)' : 'var(--ion-field-animate-border-wrong)'} `},
        { offset: 0.5, transform: 'scale(1.10)', 'box-sizing': 'border-box', border: `${this.params['borderSize']}px solid ${this.params['isCorrectValue'] === true ? 'var(--ion-field-animate-border)' : 'var(--ion-field-animate-border-wrong)'} `},
        { offset: 0.6, transform: 'scale(1.00)', 'box-sizing': 'border-box', border: `${this.params['borderSize']}px solid ${this.params['isCorrectValue'] === true ? 'var(--ion-field-animate-border)' : 'var(--ion-field-animate-border-wrong)'} `},
        { offset: 0.7, transform: 'scale(1.10)', 'box-sizing': 'border-box', border: `${this.params['borderSize']}px solid ${this.params['isCorrectValue'] === true ? 'var(--ion-field-animate-border)' : 'var(--ion-field-animate-border-wrong)'} `},
        { offset: 0.8, transform: 'scale(1.20)', 'box-sizing': 'border-box', border: `${this.params['borderSize']}px solid ${this.params['isCorrectValue'] === true ? 'var(--ion-field-animate-border)' : 'var(--ion-field-animate-border-wrong)'} `},
        { offset: 0.9, transform: 'scale(1.30)', 'box-sizing': 'border-box', border: `${this.params['borderSize']}px solid ${this.params['isCorrectValue'] === true ? 'var(--ion-field-animate-border)' : 'var(--ion-field-animate-border-wrong)'} `},
        { offset: 1.0, transform: 'scale(1.00)', 'box-sizing': 'border-box', border: `${this.params['borderSize']}px solid ${this.params['isCorrectValue'] === true ? 'var(--ion-field-animate-border)' : 'var(--ion-field-animate-border-wrong)'} `},
      ]);
  }
}
