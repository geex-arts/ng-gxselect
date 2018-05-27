import {
  AfterContentChecked, ChangeDetectorRef, Component, ContentChildren, EventEmitter, Input, OnDestroy, OnInit, Output,
  QueryList,
  ViewChild, ViewEncapsulation
} from '@angular/core';
import { of, fromEvent, merge } from 'rxjs';
import { debounceTime } from 'rxjs/operators';
import * as _ from 'lodash';

import {
  ComponentDestroyObserver,
  whileComponentNotDestroyed
} from '../../decorators/component-destroy-observer/component-destroy-observer';

import { SelectSource } from '../../stores/select-source';
import { OptionsComponent } from '../options/options.component';
import { OptionComponent } from '../option/option.component';
import { Option } from '../../models/option';
import { DefaultSelectOptions, SelectOptions } from '../select/select.component';

@Component({
  selector: 'xs-autocomplete',
  templateUrl: './autocomplete.component.html',
  styleUrls: ['./autocomplete.component.scss'],
  encapsulation: ViewEncapsulation.None
})
@ComponentDestroyObserver
export class AutocompleteComponent implements OnInit, OnDestroy, AfterContentChecked {

  @Input() input: any;
  @Input() source: SelectSource;
  @Input() options: SelectOptions = {};
  @Output() change = new EventEmitter<any>();
  @ViewChild(OptionsComponent) optionsComponent: OptionsComponent;
  @ContentChildren(OptionComponent) staticOptions = new QueryList<OptionComponent>();

  constructor(private cd: ChangeDetectorRef) { }

  ngOnInit() {
    merge([
      of({}),
      fromEvent(this.input, 'change')
    ])
      .pipe(whileComponentNotDestroyed(this))
      .subscribe(e => {
        if (this.optionsComponent.opened) {
          return;
        }
        this.source.setSearch(this.input.value);
      });

    fromEvent(this.input, 'input')
      .pipe(
        debounceTime(this.currentOptions.searchDebounce),
        whileComponentNotDestroyed(this)
      )
      .subscribe(() => this.source.search(this.input.value));

    fromEvent(this.input, 'focus')
      .pipe(whileComponentNotDestroyed(this))
      .subscribe(() => this.optionsComponent.open());

    fromEvent(this.input, 'blur')
      .pipe(whileComponentNotDestroyed(this))
      .subscribe(() => this.optionsComponent.close());
  }

  ngOnDestroy(): void { }

  ngAfterContentChecked(): void {
    if (!this.source) {
      return;
    }

    this.source.setStaticOptions(this.staticOptions.map(item => {
      return {
        value: item.value,
        name: item.name
      };
    }));
  }

  get currentOptions() {
    return _.defaults(this.options, DefaultSelectOptions);
  }

  onOptionSelected(value: Option) {
    if (!value) {
      return;
    }

    // const event = new Event('change');

    this.input.value = value.value;
    // this.input.dispatchEvent(event);
    this.change.emit(value);
  }
}
