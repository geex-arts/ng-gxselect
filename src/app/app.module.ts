import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { NgGxSelectModule } from '../../projects/ng-gxselect/src/lib/ng-gxselect.module';

import { AppComponent } from './app.component';

@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    BrowserModule,
    NgGxSelectModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
