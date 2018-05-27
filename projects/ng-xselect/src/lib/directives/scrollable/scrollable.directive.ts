import { AfterViewChecked, AfterViewInit, Directive, ElementRef, Input, OnInit } from '@angular/core';
import { BehaviorSubject, fromEvent, Observable } from 'rxjs';
import * as _ from 'lodash';

import {
  ComponentDestroyObserver,
  whileComponentNotDestroyed
} from '../../decorators/component-destroy-observer/component-destroy-observer';

export interface ScrollableState {
  vertical?: {
    progress: number;
    viewportLength: number;
    scrollLength: number;
  };
  horizontal?: {
    progress: number;
    viewportLength: number;
    scrollLength: number;
  };
}

export interface ScrollableOptions {
  vertical?: boolean;
  horizontal?: boolean;
}

@Directive({
  selector: '[xsScrollable]',
  exportAs: 'scrollableDirective'
})
@ComponentDestroyObserver
export class ScrollableDirective implements OnInit, AfterViewInit, AfterViewChecked {

  @Input() appScrollableOptions: ScrollableOptions;

  private _state = new BehaviorSubject<ScrollableState>(undefined);
  private defaultOptions: ScrollableOptions = {
    vertical: true,
    horizontal: false
  };

  get state() {
    return this._state.value;
  }

  get state$(): Observable<ScrollableState> {
    return this._state.asObservable();
  }

  set state(value) {
    this._state.next(value);
  }

  constructor(private el: ElementRef) { }

  ngOnInit() {
  }

  ngAfterViewInit(): void {
    fromEvent<WheelEvent>(this.el.nativeElement, 'wheel')
      .pipe(whileComponentNotDestroyed(this))
      .subscribe(e => {
        if (this.options.vertical && !this.options.horizontal && Math.abs(e.deltaX) > Math.abs(e.deltaY)) {
          return;
        }

        if (!this.options.vertical && this.options.horizontal && Math.abs(e.deltaY) > Math.abs(e.deltaX)) {
          return;
        }

        if (this.options.vertical) {
          const prevPosition = this.el.nativeElement.scrollTop;

          this.el.nativeElement.scrollTop += e.deltaY;

          if (this.el.nativeElement.scrollTop != prevPosition) {
            e.preventDefault();
          }
        }

        if (this.options.horizontal) {
          const prevPosition = this.el.nativeElement.scrollLeft;

          this.el.nativeElement.scrollLeft += e.deltaX;

          if (this.el.nativeElement.scrollLeft != prevPosition) {
            e.preventDefault();
          }
        }
      });

    fromEvent<WheelEvent>(this.el.nativeElement, 'scroll')
      .pipe(whileComponentNotDestroyed(this))
      .subscribe(() => this.updateState());

    this.updateState();
  }

  ngAfterViewChecked(): void {
    this.updateState();
  }

  get options(): ScrollableOptions {
    return _.defaults(this.appScrollableOptions || {}, this.defaultOptions);
  }

  updateState() {
    const state = {};

    if (this.options.vertical) {
      state['vertical'] = {
        progress: (this.el.nativeElement.scrollHeight - this.el.nativeElement.offsetHeight)
          ? this.el.nativeElement.scrollTop / (this.el.nativeElement.scrollHeight - this.el.nativeElement.offsetHeight)
          : 1,
        viewportLength: this.el.nativeElement.offsetHeight,
        scrollLength: this.el.nativeElement.scrollHeight
      };
    }

    if (this.options.horizontal) {
      state['horizontal'] = {
        progress: (this.el.nativeElement.scrollWidth - this.el.nativeElement.offsetWidth)
          ? this.el.nativeElement.scrollLeft / (this.el.nativeElement.scrollWidth - this.el.nativeElement.offsetWidth)
          : 1,
        viewportLength: this.el.nativeElement.offsetWidth,
        scrollLength: this.el.nativeElement.scrollWidth
      };
    }

    if (_.isEqual(this.state, state)) {
      return;
    }

    this.state = state;
  }

  scrollTo(position) {
    if (this.options.vertical) {
      this.el.nativeElement.scrollTop = position;
    } else if (this.options.horizontal) {
      this.el.nativeElement.scrollLeft = position;
    }
  }
}
