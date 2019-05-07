import {
  AfterContentChecked, AfterViewInit, ChangeDetectionStrategy, ChangeDetectorRef, Component, ContentChildren,
  EventEmitter, forwardRef, Input, OnChanges, OnDestroy, OnInit, Output, QueryList, SimpleChanges, TemplateRef,
  ViewChild
} from '@angular/core';
import { ViewState } from '@angular/core/src/view';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import defaults from 'lodash/defaults';

import {
  ComponentDestroyObserver,
  componentNotDestroyed
} from '../../decorators/component-destroy-observer/component-destroy-observer';

import { Option } from '../../models/option';
import { OptionComponent } from '../option/option.component';
import { SelectSource } from '../../stores/select-source';
import { StaticSelectSource } from '../../stores/static-select-source';
import { OptionsComponent } from '../options/options.component';
import { NotSet } from '../../models/not-set';

export interface SelectOptions {
  theme?: string;
  search?: boolean;
  searchDebounce?: number;
  searchMinimumLength?: number;
  optionsFitInput?: boolean;
  valueEquals?: (lhs: any, rhs: any) => boolean;
  searchPlaceholder?: string;
  classes?: string[];
}

export const DefaultSelectOptions: SelectOptions = {
  theme: 'default',
  search: false,
  searchDebounce: 200,
  searchMinimumLength: 3,
  optionsFitInput: true,
  valueEquals: (lhs: any, rhs: any) => {
    if (lhs === null || lhs === undefined || rhs === null || rhs === undefined) {
      return lhs === rhs;
    } else {
      return lhs == rhs;
    }
  },
  searchPlaceholder: 'Search...',
  classes: []
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
export class SelectComponent implements OnInit, OnDestroy, OnChanges, AfterViewInit, AfterContentChecked, ControlValueAccessor {

  @Input() options: SelectOptions = {};
  @Input() initialValue: any = NotSet;
  @Input() source: SelectSource = new StaticSelectSource();
  @Input() placeholder = 'Choose';
  @Input() disabled = false;
  @Input() optionTemplate: TemplateRef<any>;
  @Output() change = new EventEmitter<any>();
  @Output() loadedInitialValue = new EventEmitter<void>();
  @ViewChild(OptionsComponent) optionsComponent: OptionsComponent;
  @ContentChildren(OptionComponent) staticOptions = new QueryList<OptionComponent>();

  viewInitialized = false;
  loading = false;
  classes = [];

  private value: any = NotSet;
  private valueInitialSet = true;
  private valueOption: Option;
  private touchCallback = () => void {};
  private changeCallback = (_: any) => void {};

  constructor(private cd: ChangeDetectorRef) { }

  ngOnInit(): void {
    this.updateClasses();
  }

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

    if (changes['options'] && this.viewInitialized) {
      this.updateClasses();
    }
  }

  ngAfterViewInit(): void {
    this.viewInitialized = true;
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
    return defaults(this.options, DefaultSelectOptions);
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
    if (this.value === NotSet) {
      return;
    }
    
    if (!this.valueOption || !this.currentOptions.valueEquals(this.valueOption.value, this.value)) {
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

  updateClasses() {
    this.classes = ['select_theme_' + this.currentOptions.theme].concat(this.currentOptions.classes);
  }
}
