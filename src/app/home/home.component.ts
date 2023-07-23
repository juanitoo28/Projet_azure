import { Component, OnDestroy } from '@angular/core';
import { HttpClient } from "@angular/common/http";
import { environment } from '../../environnements/environnement';
import { MatDialog } from '@angular/material/dialog';
import { ImageModalComponent } from '../image-modal/image-modal.component';
import { SharedService } from '../shared.service';
import { Subscription } from 'rxjs';
import { forkJoin } from 'rxjs';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnDestroy {
  images: any[] = [];
  originalImages: any[] = [];
  searchText: string = '';
  title = "azure-storage-demo";
  searchTextSubscription: Subscription;

  constructor(private http: HttpClient, public dialog: MatDialog, private sharedService: SharedService) {
    this.searchTextSubscription = this.sharedService.searchText$.subscribe(searchText => {
      this.searchText = searchText;
      this.getImages();
    });
  }

  ngOnInit(): void {
    this.getImages();
  }

  ngOnDestroy(): void {
    this.searchTextSubscription.unsubscribe();
  }

  onDeleteSelected(): void {
    const API_URL = environment.apiUrl;
    // Filtrer les images sélectionnées
    const selectedImages = this.images.filter(image => image.selected);

    // Utiliser 'forkJoin' de 'rxjs' pour effectuer plusieurs requêtes de suppression en même temps
    const deleteObservables = selectedImages.map(image =>
      this.http.delete(`${API_URL}/delete_image/${encodeURIComponent(image.name)}`)
    );

    // Exécuter toutes les requêtes de suppression
    forkJoin(deleteObservables).subscribe(() => {
      console.log('Images supprimées avec succès');
      // Rafraîchir les images après la suppression
      this.getImages();
    }, (error) => {
      console.log(error);
    });
  }

  onSearchChange(): void {
    this.getImages();
  }

  openModal(image: any): void {
    const dialogRef = this.dialog.open(ImageModalComponent, {
      width: '500px',
      data: {
        url: image.url,
        name: image.name,
        description: image.description,
        tags: image.tags  // Pass image.tags as is
      },
    });
  
    dialogRef.afterClosed().subscribe((result) => {
      if (result === 'delete') {
        // Refresh the images list if an image was deleted
        this.getImages();
      }
    });
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
          selected: false // ajoutez cette ligne
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

  hasSelectedImages(): boolean {
    return this.images.some(image => image.selected);
  }
}
