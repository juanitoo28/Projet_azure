import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http'; 
import { environment } from '../../environnements/environnement';
import { MatDialog } from '@angular/material/dialog';
import { Subscription } from 'rxjs';
import { SharedService } from '../shared.service';

import { ImageModalComponent } from '../image-modal/image-modal.component';

@Component({
  selector: 'app-liste-images',
  templateUrl: './liste-images.component.html',
  styleUrls: ['./liste-images.component.scss']
})
export class ListeImagesComponent implements OnInit {
  images: any[] = [];
  selectedImage: any;
  originalImages: any;
  searchText: string = '';
  searchTextSubscription: Subscription;

  constructor(
    private http: HttpClient,
    private dialog: MatDialog,
    private sharedService: SharedService
  ) {
    this.searchTextSubscription = this.sharedService.searchText$.subscribe(searchText => {
      this.searchText = searchText;
      this.getImages();
    });
    this.getImages();
  }

  ngOnInit(): void {
    this.getImages();
  }

  ngOnDestroy(): void {
    this.searchTextSubscription.unsubscribe();
  }

  onSearchChange(): void {
    this.getImages();
  }

  displayMode: 'table' | 'gallery' = 'table';

  toggleDisplayMode() {
    this.displayMode = this.displayMode === 'table' ? 'gallery' : 'table';
  }

  saveImg(image: any): void {
    this.selectedImage = image; // Stockez la référence de l'image sélectionnée dans la variable selectedImage
    if (this.selectedImage) { // Vérifiez si selectedImage est défini
      console.log(this.selectedImage.tags); // Vérifiez les tags de l'image sélectionnée
  
      
    }
  }

  getImages(): void {
    const API_URL = environment.apiUrl;
    this.http.get<any[]>(`${API_URL}/get_images_list`, { params: { search: this.searchText } }).subscribe((data) => {
      this.originalImages = this.images;
      this.images = data.map((image) => {
        return {
          name: image.name,
          description: image.description,
          url: image.url,
          tags: image.tags,
          created_at: new Date(image.created_at),
          selected: false
        };
      });
    });
  }

  onSelect(): void {
    console.log(`Selected image: ${this.selectedImage}`);
    const selectedImageObject = this.images.find((image) => image.url === this.selectedImage);
    this.dialog.open(ImageModalComponent, {
      width: '600px',
      data: selectedImageObject
    });
  }
  

  openModal(image: any): void {
    const dialogRef = this.dialog.open(ImageModalComponent, {
      width: '500px',
      data: {
        url: image.url,
        name: image.name,
        description: image.description,
        tags: image.tags
      }
    });
    console.log(image.tags)
  }
}
