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
      this.selectedFiles = Array.from(target.files);
      this.previewFiles();
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
