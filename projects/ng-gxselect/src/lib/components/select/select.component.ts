import {
  AfterContentChecked, ChangeDetectionStrategy, ChangeDetectorRef, Component, ContentChildren, EventEmitter, forwardRef,
  Input, OnChanges, OnDestroy, Output, QueryList, SimpleChanges, ViewChild, ViewEncapsulation
} from '@angular/core';
import { ViewState } from '@angular/core/src/view';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import * as _ from 'lodash';

import {
  ComponentDestroyObserver,
  componentNotDestroyed
} from '../../decorators/component-destroy-observer/component-destroy-observer';

import { Option } from '../../models/option';
import { OptionComponent } from '../option/option.component';
import { SelectSource } from '../../stores/select-source';
import { StaticSelectSource } from '../../stores/static-select-source';
import { OptionsComponent } from '../options/options.component';

export interface SelectOptions {
  theme?: string;
  search?: boolean;
  searchDebounce?: number;
  optionsFitInput?: boolean;
  valueEquals?: (lhs: any, rhs: any) => boolean;
  searchPlaceholder?: string;
}

export const DefaultSelectOptions: SelectOptions = {
  theme: 'default',
  search: false,
  searchDebounce: 200,
  optionsFitInput: true,
  valueEquals: (lhs: any, rhs: any) => lhs == rhs,
  searchPlaceholder: 'Search...'
};

@Component({
  selector: 'gxs-select',
  templateUrl: './select.component.html',
  styleUrls: ['./select.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => SelectComponent),
      multi: true
    }
  ]
})
@ComponentDestroyObserver
export class SelectComponent implements OnDestroy, OnChanges, AfterContentChecked, ControlValueAccessor {

  @Input() options: SelectOptions = {};
  @Input() initialValue: any;
  @Input() source: SelectSource = new StaticSelectSource();
  @Input() placeholder = 'Choose';
  @Input() disabled = false;
  @Output() change = new EventEmitter<any>();
  @Output() loadedInitialValue = new EventEmitter<void>();
  @ViewChild(OptionsComponent) optionsComponent: OptionsComponent;
  @ContentChildren(OptionComponent) staticOptions = new QueryList<OptionComponent>();

  loading = false;

  private value: any;
  private valueInitialSet = true;
  private valueOption: Option;
  private touchCallback = () => void {};
  private changeCallback = (_: any) => void {};

  constructor(private cd: ChangeDetectorRef) { }

  ngOnDestroy(): void { }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['initialValue']) {
      this.setValue(this.initialValue);
    }

    if (changes['disabled']) {
      if (this.disabled) {
        this.optionsComponent.close();
      }
    }
  }

  ngAfterContentChecked(): void {
    if (!this.source) {
      return;
    }

    this.source.setStaticOptions(this.staticOptions.map(item => {
      return {
        value: item.value,
        name: item.name,
        data: item.data
      };
    }));
  }

  get currentOptions() {
    return _.defaults(this.options, DefaultSelectOptions);
  }

  writeValue(value: any): void {
    if (!componentNotDestroyed(this) || this.cd['_view'].state & ViewState.Destroyed) {
      return;
    }

    this.setValue(value);
    this.cd.detectChanges();
  }

  registerOnChange(fn: any): void {
    this.changeCallback = fn;
  }

  registerOnTouched(fn: any): void {
    this.touchCallback = fn;
  }

  setDisabledState(isDisabled: boolean) {
    if (!componentNotDestroyed(this) || this.cd['_view'].state & ViewState.Destroyed) {
      return;
    }

    this.disabled = isDisabled;
    this.optionsComponent.close();
    this.cd.detectChanges();
  }

  setValue(value: any) {
    if (this.currentOptions.valueEquals(value, this.value)) {
      this.valueInitialSet = false;
      this.optionsComponent.setValue(this.value);
      return;
    }

    const valueInitialSet = this.valueInitialSet;

    this.value = value;
    this.valueInitialSet = false;
    this.valueOption = undefined;
    this.optionsComponent.setValue(this.value);

    this.cd.detectChanges();

    if (!valueInitialSet) {
      this.changeCallback(this.value);
      this.touchCallback();
      this.change.next(this.value);
    }
  }

  onOptionValueSet(option: Option) {
    this.valueOption = option;
    this.value = option ? option.value : undefined;
    this.valueInitialSet = false;
    this.cd.detectChanges();
  }

  onOptionSelected(option: Option) {
    this.valueOption = option;

    const value = option ? option.value : undefined;

    if (this.currentOptions.valueEquals(value, this.value)) {
      return;
    }

    const valueInitialSet = this.valueInitialSet;

    this.value = value;
    this.valueInitialSet = false;

    this.cd.detectChanges();

    if (!valueInitialSet) {
      this.changeCallback(this.value);
      this.touchCallback();
      this.change.next(this.value);
    }
  }

  get selectedOption() {
    if (this.value === undefined) {
      return;
    }

    if (!this.valueOption || this.valueOption.value != this.value) {
      return;
    }

    return this.valueOption;
  }

  toggleOpened() {
    if (this.disabled) {
      return;
    }
    this.optionsComponent.toggleOpened();
    this.cd.detectChanges();
  }

  onClick(e) {
    if (!this.optionsComponent.opened) {
      return;
    }

    e.stopPropagation();
  }

  onBlur() {
    this.optionsComponent.close();
    this.cd.detectChanges();
  }

  onTouched() {
    this.touchCallback();
  }
}
