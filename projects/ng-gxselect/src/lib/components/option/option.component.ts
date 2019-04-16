import {
  AfterContentChecked, ChangeDetectionStrategy, Component, ElementRef, Input, OnChanges, OnDestroy, SimpleChanges
} from '@angular/core';

import { ComponentDestroyObserver } from '../../decorators/component-destroy-observer/component-destroy-observer';

@Component({
  selector: 'gxs-option',
  templateUrl: './option.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
@ComponentDestroyObserver
export class OptionComponent implements OnDestroy, OnChanges, AfterContentChecked {

  @Input() name: string;
  @Input() additionalName: string;
  @Input() value: any;
  @Input() data: any;

  constructor(public element: ElementRef) { }

  ngOnDestroy(): void { }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['name']) {
      this.updateName();
    }
  }

  ngAfterContentChecked(): void {
    this.updateName();
  }

  updateName() {
    let name = this.name;

    if (name == undefined && this.element.nativeElement.childNodes.length > 0) {
      name = this.element.nativeElement.childNodes[0].nodeValue;
    }

    this.name = name;
  }
}
