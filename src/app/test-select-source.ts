import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { map, delay } from 'rxjs/operators';

import { SelectSource } from '../../projects/ng-gxselect/src/lib/stores/select-source';
import { Option } from '../../projects/ng-gxselect/src/lib/models/option';

@Injectable()
export class TestSelectSource extends SelectSource {

  allowEmpty = false;
  emptyName = '---';

  private page = 1;
  private totalPages = 1;
  private values = [
    { value: 'value1', name: 'name1' },
    { value: 'value2', name: 'name2' },
    { value: 'value3', name: 'name3' },
    { value: 'value4', name: 'name4' },
    { value: 'value5', name: 'name5' },
    { value: 'value6', name: 'name6' },
    { value: 'value7', name: 'name7' }
  ];

  get emptyOption() {
    return {
      value: null,
      name: this.emptyName
    };
  }

  getQuery() {
    return of(this.values).pipe(delay(2000));
  }

  getDetailQuery(name) {
    return of(this.values.find(item => item.value == name)).pipe(delay(2000));
  }

  fetch(searchQuery: string): Observable<Option[]> {
    searchQuery = (searchQuery || '').trim();

    return this.getQuery()
      .pipe(map(result => {
        this.page += 1;

        const results = result
          .filter(item =>
            searchQuery != ''
              ? item.name.toLowerCase().includes(searchQuery.toLowerCase())
              : true
          )
          .map(item => {
            return {
              value: item.value,
              name: item.name
            };
          });

        if (!this.allowEmpty) {
          return results;
        }

        return [this.emptyOption].concat(results);
      }));
  }

  fetchByValue(value: any): Observable<Option> {
    if (this.allowEmpty && value === null) {
      return of(this.emptyOption);
    }

    if (!value) {
      return of(undefined);
    }

    return this.getDetailQuery(value)
      .pipe(map(item => {
        return {
          value: item.value,
          name: item.name
        };
      }));
  }

  isFetchAvailable(): boolean {
    return this.page <= this.totalPages;
  }

  resetPagination() {
    this.page = 1;
    this.totalPages = 1;
  }

  setStaticOptions(options: Option[]) { }
}
