import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NgXScrollableModule } from 'ng-xscrollable';
import { InfiniteScrollModule } from 'ngx-infinite-scroll';

import 'hammerjs';

import { SelectComponent } from './components/select/select.component';
import { OptionComponent } from './components/option/option.component';
import { OptionsComponent } from './components/options/options.component';
import { AutocompleteComponent } from './components/autocomplete/autocomplete.component';
import { AutofocusDirective } from './directives/autofocus/autofocus.directive';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    InfiniteScrollModule,
    NgXScrollableModule
  ],
  declarations: [
    SelectComponent,
    OptionComponent,
    OptionsComponent,
    AutocompleteComponent,
    AutofocusDirective
  ],
  exports: [
    SelectComponent,
    OptionComponent,
    AutocompleteComponent
  ]
})
export class NgXSelectModule { }
