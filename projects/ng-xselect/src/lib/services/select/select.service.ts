import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

import { OptionsComponent } from '../../components/options/options.component';

@Injectable({
  providedIn: 'root'
})
export class SelectService {

  private _openedOptions = new BehaviorSubject<OptionsComponent>(undefined);

  get openedOptions() {
    return this._openedOptions.value;
  }

  get openedOptions$(): Observable<OptionsComponent> {
    return this._openedOptions.asObservable();
  }

  set openedOptions(value) {
    this._openedOptions.next(value);
  }

  constructor() { }
}
