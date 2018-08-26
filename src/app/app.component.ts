import { Component } from '@angular/core';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {

  title = 'app';
  form: FormGroup;

  constructor(private fb: FormBuilder) {
    this.form = this.fb.group({ submit4: new FormControl(undefined) });
    this.form.valueChanges.subscribe(value => {
      console.log('form change', this.form.status, value);
    });
  }

  onChange(e, select) {
    console.log('onChange', e, select);
  }
}
