import {
  ChangeDetectionStrategy, ChangeDetectorRef, Component, Input, OnChanges, OnDestroy, OnInit,
  SimpleChanges
} from '@angular/core';
import { Subject, Subscription } from 'rxjs';
import { debounceTime } from 'rxjs/operators';

import {
  ComponentDestroyObserver,
  whileComponentNotDestroyed
} from '../../decorators/component-destroy-observer/component-destroy-observer';

import { ScrollableDirective, ScrollableState } from '../../directives/scrollable/scrollable.directive';

@Component({
  selector: 'xs-scrollbar',
  templateUrl: './scrollbar.component.html',
  styleUrls: ['./scrollbar.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
@ComponentDestroyObserver
export class ScrollbarComponent implements OnInit, OnDestroy, OnChanges {

  @Input() scrollable: ScrollableDirective;
  @Input() theme = 'default';
  @Input() hideTimeout = 300;

  state: ScrollableState;
  subscription: Subscription;
  stateUpdated = new Subject<void>();
  stateUpdatedRecently = false;

  constructor(private cd: ChangeDetectorRef) { }

  ngOnInit() {
    if (this.hideTimeout == undefined) {
      return;
    }

    this.stateUpdated
      .pipe(
        debounceTime(this.hideTimeout),
        whileComponentNotDestroyed(this)
      )
      .subscribe(() => {
        this.stateUpdatedRecently = false;
        this.cd.detectChanges();
      });
  }

  ngOnDestroy(): void {
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['scrollable']) {
      if (this.subscription) {
        this.subscription.unsubscribe();
      }

      if (this.scrollable) {
        this.subscription = this.scrollable.state$
          .pipe(whileComponentNotDestroyed(this))
          .subscribe(state => {
            this.state = state;
            this.stateUpdatedRecently = true;
            this.stateUpdated.next();
            this.cd.detectChanges();
          });
      } else {
        this.subscription = undefined;
      }
    }
  }

  get visibleVertical() {
    if (!this.state || !this.state.vertical) {
      return false;
    }

    if (this.verticalHeightPercentage == 100) {
      return false;
    }

    if (!this.stateUpdatedRecently) {
      return false;
    }

    return true;
  }

  get verticalHeightPercentage() {
    const value = this.state.vertical.viewportLength / this.state.vertical.scrollLength * 100;
    return Math.max(value, 5);
  }

  get verticalTopPercentage() {
    return this.state.vertical.progress * (100 - this.verticalHeightPercentage);
  }
}
