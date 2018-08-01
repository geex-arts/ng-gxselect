import {
  AfterContentChecked, ChangeDetectionStrategy, ChangeDetectorRef, Component, ContentChildren, EventEmitter, forwardRef,
  Input, OnChanges, OnDestroy, Output, QueryList, SimpleChanges, ViewChild, ViewEncapsulation
} from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import * as _ from 'lodash';

import { ComponentDestroyObserver } from '../../decorators/component-destroy-observer/component-destroy-observer';

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
}

export const DefaultSelectOptions: SelectOptions = {
  theme: 'default',
  search: false,
  searchDebounce: 200,
  optionsFitInput: true
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
  @Output() change = new EventEmitter<any>();
  @Output() loadedInitialValue = new EventEmitter<void>();
  @ViewChild(OptionsComponent) optionsComponent: OptionsComponent;
  @ContentChildren(OptionComponent) staticOptions = new QueryList<OptionComponent>();

  loading = false;

  private value: any;
  private valueOption: Option;
  private touchCallback = () => void {};
  private changeCallback = (_: any) => void {};

  constructor(private cd: ChangeDetectorRef) { }

  ngOnDestroy(): void { }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['initialValue']) {
      this.setValue(this.initialValue);
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
    this.setValue(value);
    this.cd.detectChanges();
  }

  registerOnChange(fn: any): void {
    this.changeCallback = fn;
  }

  registerOnTouched(fn: any): void {
    this.touchCallback = fn;
  }

  setValue(value: any) {
    this.value = value;
    this.valueOption = undefined;
    this.optionsComponent.setValue(this.value);
    this.changeCallback(this.value);
    this.touchCallback();
    this.cd.detectChanges();
    this.change.next(this.value);
  }

  onOptionSelected(value: Option) {
    this.value = value ? value.value : undefined;
    this.valueOption = value;
    this.changeCallback(this.value);
    this.touchCallback();
    this.cd.detectChanges();
    this.change.next(this.value);
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
    this.optionsComponent.toggleOpened();
  }

  onClick(e) {
    if (!this.optionsComponent.opened) {
      return;
    }

    e.stopPropagation();
  }

  onBlur() {
    this.optionsComponent.close();
  }

  onTouched() {
    this.touchCallback();
  }
}
