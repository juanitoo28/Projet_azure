import { Component } from '@angular/core';
import { SharedService } from '../shared.service'; // Ajoutez cette ligne

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
})
export class HeaderComponent {
  constructor(private sharedService: SharedService) {} // Ajoutez cette ligne

  filterImages(event: KeyboardEvent): void {
    const target = event.target as HTMLInputElement;
    const searchText = target?.value || '';
    this.sharedService.setSearchText(searchText);
  }  
  
}
