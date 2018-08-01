import {
  ChangeDetectionStrategy, ChangeDetectorRef, Component, ElementRef, EventEmitter, Input, OnChanges, OnDestroy, OnInit,
  Output, SimpleChanges, ViewChild
} from '@angular/core';
import { Subject, Subscription } from 'rxjs';
import { debounceTime, filter } from 'rxjs/operators';
import { ScrollableDirective } from 'ng-gxscrollable';

import {
  ComponentDestroyObserver,
  whileComponentNotDestroyed
} from '../../decorators/component-destroy-observer/component-destroy-observer';

import { SelectSource } from '../../stores/select-source';
import { StaticSelectSource } from '../../stores/static-select-source';
import { Option } from '../../models/option';
import { SelectOptions } from '../select/select.component';
import { SelectService } from '../../services/select/select.service';

export enum OptionsPosition {
  BottomLeft,
  BottomRight,
  TopLeft,
  TopRight
}

@Component({
  selector: 'gxs-options',
  templateUrl: './options.component.html',
  styleUrls: ['./options.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
@ComponentDestroyObserver
export class OptionsComponent implements OnInit, OnDestroy, OnChanges {

  @Input() input: any;
  @Input() source: SelectSource = new StaticSelectSource();
  @Input() config: SelectOptions = {};
  @Output() change = new EventEmitter<Option>();
  @Output() touch = new EventEmitter<void>();
  @Output() loadedInitialValue = new EventEmitter<void>();
  @ViewChild('root') root: ElementRef;
  @ViewChild(ScrollableDirective) scrollable: ScrollableDirective;

  optionsPositions = OptionsPosition;
  optionsPosition = OptionsPosition.BottomLeft;
  searchQuery = '';
  searchUpdated = new Subject<void>();
  options: Option[] = [];
  value: any;
  valueOption: Option;
  loading = false;
  opened = false;

  private sourceSubscriptions: Subscription[] = [];

  constructor(private cd: ChangeDetectorRef,
              private selectService: SelectService) { }

  ngOnInit(): void {
    this.searchUpdated
      .pipe(
        whileComponentNotDestroyed(this),
        debounceTime(this.config.searchDebounce)
      )
      .subscribe(() => {
        this.source.search(this.searchQuery != '' ? this.searchQuery : undefined);
      });

    this.selectService.openedOptions$
      .pipe(
        filter(component => component && component !== this),
        whileComponentNotDestroyed(this)
      )
      .subscribe(() => this.close());

    this.initOptions();
  }

  ngOnDestroy(): void { }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['source']) {
      this.deinitOptions();
      this.initOptions();
    }
  }

  deinitOptions() {
    if (this.sourceSubscriptions.length) {
      this.sourceSubscriptions.forEach(item => item.unsubscribe());
      this.sourceSubscriptions = [];
    }
  }

  initOptions() {
    if (!this.source) {
      return;
    }

    this.valueOption = undefined;
    this.options = [];
    this.loading = false;
    this.cd.detectChanges();

    this.sourceSubscriptions.push(this.source.valueOption$
      .pipe(whileComponentNotDestroyed(this))
      .subscribe(option => {
        this.valueOption = option;
        this.change.next(this.valueOption);
        this.cd.detectChanges();
      }));
    this.sourceSubscriptions.push(this.source.options$
      .pipe(whileComponentNotDestroyed(this))
      .subscribe(options => {
        this.options = options;

        if (!this.valueOption && this.value != undefined) {
          this.sourceSubscriptions.push(this.source.loadValue(this.value)
            .pipe(whileComponentNotDestroyed(this))
            .subscribe(() => {
              this.loadedInitialValue.next();
            }));
        }

        this.cd.detectChanges();
      }));
    this.sourceSubscriptions.push(this.source.loading$
      .pipe(whileComponentNotDestroyed(this))
      .subscribe(loading => {
        this.loading = loading;
        this.cd.detectChanges();
      }));

    if (this.value != undefined) {
      this.sourceSubscriptions.push(this.source.loadValue(this.value)
        .pipe(whileComponentNotDestroyed(this))
        .subscribe(() => {
          this.loadedInitialValue.next();
        }));
    }
  }

  loadMore() {
    if (!this.source) {
      return;
    }

    this.source.loadMore();
  }

  setValue(value: any) {
    this.value = value;
    this.valueOption = this.selectedOption;
    this.opened = false;
    this.cd.detectChanges();
    this.change.next(this.valueOption || { value: this.value, name: undefined });
  }

  get selectedOption() {
    if (this.value === undefined) {
      return;
    }

    if (this.valueOption && this.valueOption.value == this.value) {
      return this.valueOption;
    }

    return this.options.find(item => item.value == this.value);
  }

  toggleOpened() {
    if (this.opened) {
      this.close();
    } else {
      this.open();
    }
  }

  get styles() {
    const styles = {};
    if (this.config.optionsFitInput) {
      styles['min-width'] = `${this.input.offsetWidth}px`;
    }
    return styles;
  }

  open() {
    if (this.opened) {
      return;
    }

    if (!this.source.loaded) {
      this.source.loadMore();
    }

    this.opened = true;
    this.optionsPosition = this.calculateOptionsPosition();
    this.scrollable.scrollTo(0);
    this.touch.emit();
    this.cd.detectChanges();
    this.selectService.openedOptions = this;
  }

  close() {
    if (!this.opened) {
      return;
    }

    this.opened = false;
    this.touch.emit();
    this.cd.detectChanges();

    setTimeout(() => {
      this.optionsPosition = OptionsPosition.BottomLeft;
      this.cd.detectChanges();
    }, 500); // Workaround
  }

  calculateOptionsPosition() {
    const inputRect = this.input.getBoundingClientRect();
    const rect = this.root.nativeElement.getBoundingClientRect().toJSON();

    rect.top = rect.top - inputRect.height - rect.height;
    rect.left = rect.left - rect.width + inputRect.width;
    rect.bottom = window.innerHeight - rect.bottom;
    rect.right = window.innerWidth - rect.right;

    let position: OptionsPosition;

    if (rect.top >= 0 && rect.bottom < 0 && (rect.left >= 0 || rect.right < 0)) {
      position = OptionsPosition.TopLeft;
    } else if (rect.top >= 0 && rect.bottom < 0 && rect.left < 0 && rect.right >= 0) {
      position = OptionsPosition.TopRight;
    } else if ((rect.top < 0 || rect.bottom >= 0) && rect.left < 0 && rect.right >= 0) {
      position = OptionsPosition.BottomRight;
    } else {
      position = OptionsPosition.BottomLeft;
    }

    return position;
  }

  trackByFn(index, item: Option) {
    return `${item.name}_${item.value}`;
  }

  onScrolled() {
    this.loadMore();
  }
}
