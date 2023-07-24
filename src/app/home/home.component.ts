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
  selectedImage: any; // Déclarez cette variable pour stocker la référence de l'image sélectionnée
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
    this.selectedImage = image; // Stockez la référence de l'image sélectionnée dans la variable selectedImage
    if (this.selectedImage) { // Vérifiez si selectedImage est défini
      console.log(this.selectedImage.tags); // Vérifiez les tags de l'image sélectionnée
  
      const dialogRef = this.dialog.open(ImageModalComponent, {
        width: '500px',
        data: {
          url: this.selectedImage.url,
          name: this.selectedImage.name,
          description: this.selectedImage.description,
          tags: this.selectedImage.tags
        },
      });
  
      dialogRef.afterClosed().subscribe((result) => {
        if (result === 'delete') {
          // Rafraîchir les images après la suppression
          this.getImages();
        }
      });
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
