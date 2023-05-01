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
  selectedFile: File | null = null;
  previewUrl: string | null = null;
  uploadMessage: string | null = null;
  uploadMessageColor: string | null = null;

  constructor(private http: HttpClient, private router: Router) {}

  ngOnInit(): void {
  }

  onFileSelected(event: Event): void {
    const target = event.target as HTMLInputElement;
    if (target.files) {
      this.selectedFile = target.files[0];
      this.previewFile();
    }
  }

  previewFile() {
    if (this.selectedFile) {
      const reader = new FileReader();
      reader.readAsDataURL(this.selectedFile);
      reader.onload = () => {
        this.previewUrl = reader.result as string;
      };
    }
  }
  

  onUpload(): void {
    if (!this.selectedFile) {
      console.log("No file selected");
      return;
    }
    const formData = new FormData();
    formData.append("image", this.selectedFile, this.selectedFile.name);
    const API_URL = environment.apiUrl;
    this.http.post(`${API_URL}/upload`, formData).subscribe(
      (response) => {
        console.log(response);

        // Rediriger l'utilisateur vers la page d'accueil
        this.router.navigate(['/']);

        // Effacer le champ du nom de l'image et afficher un message de succès
        this.uploadMessage = "Image téléchargée avec succès";
        this.uploadMessageColor = "green";
      },
      (error) => {
        console.log(error);

        // Afficher un message d'erreur
        this.uploadMessage = "Erreur lors du téléchargement de l'image";
        this.uploadMessageColor = "red";
      }
    );
  }
}
