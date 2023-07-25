import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { HttpClient } from '@angular/common/http'; 
import { environment } from '../../environnements/environnement';
import { MatDialog } from '@angular/material/dialog';
import { Subscription } from 'rxjs';
import { SharedService } from '../shared.service';
import { forkJoin } from 'rxjs';

import { ImageModalComponent } from '../image-modal/image-modal.component';

@Component({
  selector: 'app-liste-images',
  templateUrl: './liste-images.component.html',
  styleUrls: ['./liste-images.component.scss']
})
export class ListeImagesComponent implements OnInit {
  @ViewChild('imagePreview') imagePreview!: ElementRef;
  previewImageUrl = '';
  images: any[] = [];
  selectedImage: any;
  originalImages: any;
  searchText: string = '';
  searchTextSubscription: Subscription;
  numberOfColumns = 4; 
  selectedImageForPreview: string | null = null;
  confidenceThreshold: number; 
  confidenceThresholdSubscription: Subscription;  
  selectAllImagesCheckbox: boolean = false;


  constructor(
    private http: HttpClient,
    private dialog: MatDialog,
    private sharedService: SharedService
  ) {
    this.confidenceThreshold = 0.55; // Initialisation à une valeur par défaut
    this.searchTextSubscription = this.sharedService.searchText$.subscribe(searchText => {
      this.searchText = searchText;
      this.getImages();
    });
    this.confidenceThresholdSubscription = this.sharedService.confidenceThreshold$.subscribe(confidenceThreshold => {
      this.confidenceThreshold = confidenceThreshold;
      this.getImages();
    });
  }

  ngOnInit(): void {
    this.getImages();
  }

  ngOnDestroy(): void {
    this.searchTextSubscription.unsubscribe();
    this.confidenceThresholdSubscription.unsubscribe();
  }

  onSelectAllImagesChange() {
    // Mettre à jour la propriété 'selected' de toutes les images en fonction de la case à cocher 'Sélectionner tout'
    this.images.forEach(image => image.selected = this.selectAllImagesCheckbox);
  }
  
  onSearchChange(): void {
    this.getImages();
  }

  displayMode: 'table' | 'gallery' = 'table';

  selectImageForPreview(url: string) {
    this.selectedImageForPreview = url;
  }
  

  toggleDisplayMode() {
    this.displayMode = this.displayMode === 'table' ? 'gallery' : 'table';
  }

  onConfidenceThresholdChange(): void {
    this.sharedService.setConfidenceThreshold(this.confidenceThreshold);
  }
  

  setConfidenceThreshold(threshold: number): void {
    this.sharedService.setConfidenceThreshold(threshold);
  }

  saveImg(image: any): void {
    this.selectedImage = image; 

    if (this.selectedImage) { 
      console.log(this.selectedImage.tags); 
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
  
      // Filtrez les images uniquement si un texte de recherche est fourni
      if (this.searchText) {
        this.images = this.images.filter(image => image.tags.some((tag: any) => tag.name.toLowerCase() === this.searchText.toLowerCase() && tag.confidence >= this.confidenceThreshold));  // modification de cette ligne
      }
    });
  }

  //Ancienne recherche sans la condition des tags supérieur à 95%:
  
  // getImages(): void {
  //   const API_URL = environment.apiUrl;
  //   this.http.get<any[]>(`${API_URL}/get_images_list`, { params: { search: this.searchText } }).subscribe((data) => {
  //     this.originalImages = this.images;
  //     this.images = data.map((image) => {
  //       return {
  //         name: image.name,
  //         description: image.description,
  //         url: image.url,
  //         tags: image.tags,
  //         created_at: new Date(image.created_at),
  //         selected: false // Assurez-vous que chaque image a une propriété 'selected'
  //       };
  //     });
  //   });
  // }

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

  onDeleteSelected(): void {
    const API_URL = environment.apiUrl;
    const selectedImages = this.images.filter(image => image.selected);

    const deleteObservables = selectedImages.map(image =>
      this.http.delete(`${API_URL}/delete_image/${encodeURIComponent(image.name)}`)
    );

    forkJoin(deleteObservables).subscribe(() => {
      console.log('Images supprimées avec succès');
      this.getImages();
    }, (error) => {
      console.log(error);
    });
  }

  onDownloadSelected(): void {
    const API_URL = environment.apiUrl;
    const selectedImages = this.images.filter(image => image.selected);
  
    selectedImages.forEach(image => {
      this.http
        .get(`${API_URL}/download/${encodeURIComponent(image.name)}`, {
          responseType: "blob",
        })
        .subscribe(
          (response) => {
            const url = window.URL.createObjectURL(response);
            const link = document.createElement("a");
            link.href = url;
            link.download = image.name;
            link.click();
          },
          (error) => {
            console.log(error);
          }
        );
    });
  }

  showPreview(event: MouseEvent, imageUrl: string): void {
    this.previewImageUrl = imageUrl;
    this.imagePreview.nativeElement.style.display = 'block';
    this.movePreview(event);
  }
  
  movePreview(event: MouseEvent): void {
    const previewWidth = this.imagePreview.nativeElement.offsetWidth;
    const previewHeight = this.imagePreview.nativeElement.offsetHeight;
  
    this.imagePreview.nativeElement.style.left = (event.clientX - previewWidth / 2) + 'px';
    this.imagePreview.nativeElement.style.top = (event.clientY - previewHeight / 2) + 'px';
  }
  
  hidePreview(): void {
    this.previewImageUrl = '';
    this.imagePreview.nativeElement.style.display = 'none';
  }
  
  // Galerie d'images:
  changeNumberOfColumns(number: number): void {
    this.numberOfColumns = number;
  }
  
}

