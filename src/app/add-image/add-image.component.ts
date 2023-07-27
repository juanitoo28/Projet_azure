import { Component, OnInit } from '@angular/core';
import { HttpClient } from "@angular/common/http"; 
import { environment } from '../../environnements/environnement';
import { Router } from '@angular/router';

@Component({
  selector: 'add-image',
  templateUrl: './add-image.component.html',
  styleUrls: ['./add-image.component.scss']
})
export class AddImageComponent implements OnInit {
  selectedFiles: File[] = [];
  previewUrls: string[] = [];
  uploadMessage: string | null = null;
  uploadMessageColor: string | null = null;

  constructor(private http: HttpClient, private router: Router) {}

  ngOnInit(): void {
  }

  onFilesSelected(event: Event): void {
    const target = event.target as HTMLInputElement;
    if (target.files) {
      this.selectedFiles = [];
      this.uploadMessage = null;
      Array.from(target.files).forEach((file) => {
        if (file.size > 5000000) {  // Taille max 5Mo
          this.uploadMessage = "La taille des fichiers ne peut pas dépasser 5Mo.";
          this.uploadMessageColor = "red";
        } else if (file.type !== "image/jpeg" && file.type !== "image/png") {  // Seuls les types JPEG et PNG sont autorisés
          this.uploadMessage = "Seuls les fichiers de type JPEG et PNG sont autorisés.";
          this.uploadMessageColor = "red";
        } else {
          this.selectedFiles.push(file);
        }
      });
      if (this.selectedFiles.length > 0) {
        this.previewFiles();
      }
    }
  }
  

  previewFiles() {
    this.previewUrls = [];
    this.selectedFiles.forEach((file) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        this.previewUrls.push(reader.result as string);
      };
    });
  }
  
  onUpload(): void {
    if (this.selectedFiles.length === 0) {
      console.log("No file selected");
      return;
    }
    const formData = new FormData();
    this.selectedFiles.forEach((file) => {
      formData.append("image", file, file.name);
    });
    const API_URL = environment.apiUrl;
    this.http.post(`${API_URL}/upload`, formData).subscribe(
      (response) => {
        console.log(response);

        // Rediriger l'utilisateur vers la page d'accueil
        this.router.navigate(['/']);

        // Effacer le champ du nom de l'image et afficher un message de succès
        this.uploadMessage = "Images téléchargées avec succès";
        this.uploadMessageColor = "green";
      },
      (error) => {
        console.log(error);

        // Afficher un message d'erreur
        this.uploadMessage = "Erreur lors du téléchargement des images";
        this.uploadMessageColor = "red";
      }
    );
  }
}
