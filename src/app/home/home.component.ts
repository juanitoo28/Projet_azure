import { Component, OnDestroy } from '@angular/core';
import { HttpClient } from "@angular/common/http"; 
import { environment } from '../../environnements/environnement';
import { Router } from '@angular/router';
import { ImageModalComponent } from '../image-modal/image-modal.component';
import { MatDialog } from '@angular/material/dialog';
import { SharedService } from '../shared.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnDestroy{
  images: any[] = [];
  title = "azure-storage-demo";
  originalImages: any[] = [];

  searchTextSubscription: Subscription;

  constructor(private http: HttpClient, public dialog: MatDialog, private sharedService: SharedService) {
    this.searchTextSubscription = this.sharedService.searchText$.subscribe(searchText => {
      this.getImages(searchText);
    });
  }

  ngOnInit(): void {
    this.getImages();
  }
  

  // filterImages(searchText: string): void {
  //   searchText = searchText.toLowerCase();
  //   this.images = this.originalImages.filter((image) => {
  //     return (
  //       image.name.toLowerCase().includes(searchText) ||
  //       image.description.toLowerCase().includes(searchText) ||
  //       image.tags.toLowerCase().includes(searchText)
  //     );
  //   });
  // }

  openModal(image: any): void {
    const dialogRef = this.dialog.open(ImageModalComponent, {
      width: '500px',
      data: {
        url: image.url,
        name: image.name,
        description: 'Description de l\'image ' + image.description,
        tags: 'Tags: ' + image.tags
      },
    });
  
    dialogRef.afterClosed().subscribe((result) => {
      if (result === 'delete') {
        // Refresh the images list if an image was deleted
        this.getImages();
      }
    });
  }
  

  getImages(searchText: string = ''): void {
    const API_URL = environment.apiUrl;
    this.http.get<any[]>(`${API_URL}/get_images_list`, { params: { search: searchText } }).subscribe((data) => {
   
    // this.http.get<any[]>(`${API_URL}/get_images_list`).subscribe((data) => {
      console.log(data);
      this.originalImages = this.images;
      this.images = data.map((image) => {
        return {
          name: image.name,
          description: image.description,
          url: image.url,
          tags: image.tags,
          created_at: new Date(image.created_at),
        };
      });
    });
  }

  onDownload(imageName: any): void {
    const API_URL = environment.apiUrl;
    this.http
      .get(`${API_URL}/download/${imageName}`, {
        responseType: "blob",
      })
      .subscribe(
        (response) => {
          const url = window.URL.createObjectURL(response);
          const link = document.createElement("a");
          link.href = url;
          link.download = imageName;
          link.click();
        },
        (error) => {
          console.log(error);
        }
      );
  }
  ngOnDestroy(): void {
    this.searchTextSubscription.unsubscribe();
  }
}

