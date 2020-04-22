import { Injectable } from '@angular/core';
import trim from 'lodash/trim';
import isEqual from 'lodash/isEqual';
import { Observable, of } from 'rxjs';

import { SelectSource } from './select-source';
import { Option } from '../models/option';

@Injectable()
export class StaticSelectSource extends SelectSource {

  staticOptions: Option[] = [];
  fetched = false;

  fetch(searchQuery: string): Observable<Option[]> {
    let items = this.staticOptions;

    if (searchQuery != undefined) {
      const query = trim(searchQuery.toLowerCase());

      if (query != '') {
        items = items.filter(item =>
          item.name != undefined && item.name != null && item.name.toString().toLowerCase().indexOf(query) != -1
        );
      }
    }

    this.fetched = true;
    return of(items);
  }

  fetchByValue(value: any): Observable<Option> {
    return of(this.staticOptions.find(item => this.config.valueEquals(item.value, value)));
  }

  isFetchAvailable(): boolean {
    return !this.fetched;
  }

  resetPagination() {
    this.fetched = false;
  }

  setStaticOptions(options: Option[]) {
    if (isEqual(this.staticOptions, options)) {
      return;
    }
    this.staticOptions = options;
    this.reset();
    this.loadMore();
  }
}
