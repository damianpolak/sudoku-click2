import { Directive, ElementRef, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { fromEvent, switchMap, timer, takeUntil } from 'rxjs';
import { BaseComponent } from '../abstracts/base-component.abstract';

@Directive({
  selector: '[appHoldTouch]',
})
export class HoldTouchDirective extends BaseComponent implements OnInit, OnDestroy {
  @Input() appHoldTouch = 2000;
  @Output() holdTouch = new EventEmitter<void>();

  constructor(private readonly elementRef: ElementRef) {
    super();
  }

  ngOnInit(): void {
    const button = this.elementRef.nativeElement as HTMLButtonElement;
    const touchStart$ = fromEvent(button, 'touchstart');
    const touchEnd$ = fromEvent(button, 'touchend');

    const touch$ = touchStart$.pipe(switchMap(() => timer(this.appHoldTouch || 2000).pipe(takeUntil(touchEnd$))));

    const touchHoldSub$ = touch$.subscribe(() => this.holdTouch.emit());
    this.registerSubscriptions([touchHoldSub$]);
  }

  ngOnDestroy(): void {
    this.unsubscribeSubscriptions();
  }
}
