import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { NgXSelectModule } from '../../projects/ng-xselect/src/lib/ng-xselect.module';

import { AppComponent } from './app.component';

@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    BrowserModule,
    NgXSelectModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
