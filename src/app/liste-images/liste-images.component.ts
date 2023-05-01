import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http'; 
import { environment } from '../../environnements/environnement';
import { MatDialog } from '@angular/material/dialog';

import { ImageModalComponent } from '../image-modal/image-modal.component';

@Component({
  selector: 'app-liste-images',
  templateUrl: './liste-images.component.html',
  styleUrls: ['./liste-images.component.scss']
})
export class ListeImagesComponent implements OnInit {
  images: any[] = [];
  selectedImage =  ""; 

  constructor(
    private http: HttpClient,
    private dialog: MatDialog,
  ) {}

  ngOnInit(): void {
    this.getImages();
  }

  getImages(): void {
    const API_URL = environment.apiUrl;
    this.http.get<any[]>(`${API_URL}/get_images_list`).subscribe((data) => {
      console.log(data);
      this.images = data.map((image: any) => { 
        return {
          name: image.name,
          description: image.description,
          url: image.url,
          tags: image.tags,
          created_at: new Date(image.created_at),
        };
      });
      if (this.images.length > 0) {
        this.selectedImage = this.images[0].url;
      }
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
        description: '' + image.description,
        tags: '' + image.tags
      }
    });
  }
}
