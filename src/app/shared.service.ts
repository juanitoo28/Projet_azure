import { Injectable } from '@angular/core';
import { Subject, BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class SharedService {
  private searchText = '';
  public searchTextChanged = new Subject<string>();
  public searchText$ = new BehaviorSubject<string>(this.searchText);
  private confidenceThreshold = 0.95;
  public confidenceThresholdChanged = new Subject<number>();
  confidenceThreshold$: BehaviorSubject<number> = new BehaviorSubject<number>(0.95);

  setConfidenceThreshold(threshold: number): void {
    this.confidenceThreshold = threshold;
    this.confidenceThresholdChanged.next(this.confidenceThreshold);
    this.confidenceThreshold$.next(this.confidenceThreshold);
  }

  getConfidenceThreshold(): number {
    return this.confidenceThreshold;
  }

  setSearchText(text: string): void {
    this.searchText = text;
    this.searchTextChanged.next(this.searchText);
    this.searchText$.next(this.searchText);
  }

  getSearchText(): string {
    return this.searchText;
  }
}
