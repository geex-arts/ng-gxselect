import { Directive, ElementRef, Input, OnChanges, SimpleChanges } from '@angular/core';

@Directive({
  selector: '[xsAutofocus]'
})
export class AutofocusDirective implements OnChanges {

  @Input() xsAutofocus = false;

  constructor(private el: ElementRef) {}

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['xsAutofocus'].currentValue) {
      this.el.nativeElement.focus();
    }
  }
}
