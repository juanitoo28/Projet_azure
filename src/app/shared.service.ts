import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class SharedService {
  private searchTextSource = new Subject<string>();
  searchText$ = this.searchTextSource.asObservable();

  setSearchText(searchText: string): void {
    this.searchTextSource.next(searchText);
  }
}
