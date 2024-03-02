import { Component, HostBinding, HostListener, Input, OnInit } from '@angular/core';
import { DomSanitizer, SafeStyle } from '@angular/platform-browser';

@Component({
  selector: 'app-number-button',
  templateUrl: './number-button.component.html',
  styleUrls: ['./number-button.component.scss'],
})
export class NumberButtonComponent implements OnInit {
  @Input() value: string = '';
  @Input() missingValue: string = '';
  @HostListener('click', ['$event'])
  mouseclick(event: PointerEvent) {
    this.style = this.sanitizer.bypassSecurityTrustStyle('transform: scale(1.1); z-index: 10;');
    setTimeout(() => {
      this.mouseleave(event);
    }, 300);
  }

  @HostListener('mouseleave', ['$event'])
  mouseleave(event: PointerEvent) {
    this.style = this.sanitizer.bypassSecurityTrustStyle('transform: scale(1); z-index: unset;');
  }

  @HostBinding('style') style!: SafeStyle;
  constructor(private sanitizer: DomSanitizer) {}

  ngOnInit() {
    console.log();
  }
}
