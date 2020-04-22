import { Component } from '@angular/core';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';

import { TestSelectSource } from './test-select-source';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  providers: [TestSelectSource]
})
export class AppComponent {

  title = 'app';
  form: FormGroup;

  constructor(private fb: FormBuilder, public source: TestSelectSource) {
    this.source.allowEmpty = true;
    this.form = this.fb.group({
      submit4: new FormControl(undefined),
      submit7: new FormControl(undefined)
    });

    this.form.valueChanges.subscribe(value => {
      console.log('form change', this.form.status, value);
    });

    setTimeout(() => this.form.patchValue({ submit4: 'value1' }), 1000);
    setTimeout(() => this.form.patchValue({ submit4: 'value2' }), 2000);

    setTimeout(() => this.form.patchValue({ submit7: 'value1' }), 1000);
    setTimeout(() => this.form.patchValue({ submit7: 'value2' }), 2500); // before previous finished
  }

  onChange(e, select) {
    console.log('onChange', e, select);
  }

  valueEquals(lhs: { value: string }, rhs: { value: string }) {
    return (lhs ? lhs.value : null) == (rhs ? rhs.value : null);
  }
}
