import { Injectable } from '@angular/core';
import { Subject, BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class SharedService {
  private searchText = '';
  public searchTextChanged = new Subject<string>();
  public searchText$ = new BehaviorSubject<string>(this.searchText);

  setSearchText(text: string): void {
    this.searchText = text;
    this.searchTextChanged.next(this.searchText);
    this.searchText$.next(this.searchText);
  }

  getSearchText(): string {
    return this.searchText;
  }
}
