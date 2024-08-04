/**
 * @FIX - This directive is not working as expected. It should hide the element based on the input value.
 */
import { Directive, HostBinding, Input, OnChanges, SimpleChanges } from '@angular/core';

type HiddenMode = 'full' | 'partial';
@Directive({
  selector: '[appHidden]',
})
export class HiddenDirective implements OnChanges {
  @Input() appHidden!: boolean;
  @Input() hiddenMode: HiddenMode = 'partial';

  @HostBinding('style.display') display!: string;
  @HostBinding('style.visibility') visibility!: string;

  constructor() {}

  ngOnChanges(changes: SimpleChanges): void {
    if (this.appHidden) {
      if (this.hiddenMode === 'full') {
        this.display = 'none';
      } else {
        this.visibility = 'hidden';
      }
    }
  }
}
