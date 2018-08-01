import { BehaviorSubject, Observable, Subscription } from 'rxjs';

import { Option } from '../models/option';

export abstract class SelectSource {

  private _valueOption = new BehaviorSubject<Option>(undefined);
  private _options = new BehaviorSubject<Option[]>([]);
  private _loading = new BehaviorSubject<boolean>(false);
  private loadRequested = false;
  private fetchRequest: Subscription;
  private searchQuery: string;
  private _loaded = false;

  get valueOption() {
    return this._valueOption.value;
  }

  get valueOption$(): Observable<Option> {
    return this._valueOption.asObservable();
  }

  set valueOption(value) {
    this._valueOption.next(value);
  }

  get options() {
    return this._options.value;
  }

  get options$(): Observable<Option[]> {
    return this._options.asObservable();
  }

  set options(value) {
    this._options.next(value);
  }

  get loading() {
    return this._loading.value;
  }

  get loading$(): Observable<boolean> {
    return this._loading.asObservable();
  }

  set loading(value) {
    this._loading.next(value);
  }

  get loaded() {
    return this._loaded;
  }

  reset() {
    this.options = [];
    this.loading = false;
    this._loaded = false;
    this.loadRequested = false;
    this.resetPagination();

    if (this.fetchRequest) {
      this.fetchRequest.unsubscribe();
      this.fetchRequest = undefined;
    }
  }

  search(search) {
    this.setSearch(search);

    if (this.searchQuery == search && (this.loaded || this.loading)) {
      return;
    }

    this.loadMore();
  }

  setSearch(search) {
    if (this.searchQuery == search) {
      return;
    }

    this.reset();
    this.searchQuery = search;
  }

  loadMore() {
    if (!this.isFetchAvailable()) {
      return;
    }

    if (this.loading) {
      this.loadRequested = true;
      return;
    }

    this.loading = true;
    this.fetchRequest = this.fetch(this.searchQuery).subscribe(
      options => {
        this.options = this.options.concat(options);
        this.loading = false;
        this._loaded = true;
        this.fetchRequest = undefined;

        if (this.loadRequested) {
          this.loadRequested = false;
          this.loadMore();
        }
      },
      () => {
        this.loading = false;
        this._loaded = true;
        this.fetchRequest = undefined;

        if (this.loadRequested) {
          this.loadRequested = false;
          this.loadMore();
        }
      }
    );
  }

  loadValue(value: any): Observable<Option> {
    const obs = this.fetchByValue(value);
    obs.subscribe(option => this.valueOption = option);
    return obs;
  }

  abstract fetch(searchQuery: string): Observable<Option[]>;

  abstract fetchByValue(value: any): Observable<Option>;

  abstract isFetchAvailable(): boolean;

  abstract resetPagination();

  abstract setStaticOptions(options: Option[]);
}
