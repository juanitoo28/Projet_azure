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

  constructor(private http: HttpClient, private router: Router) {}


  ngOnInit(): void {
  }

  onFileSelected(event: Event): void {
    const target = event.target as HTMLInputElement;
    if (target.files) {
      this.selectedFile = target.files[0];
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
        const fileInput = document.getElementById("file-input") as HTMLInputElement;
        const uploadMessage = document.getElementById("upload-message") as HTMLSpanElement;
        if (fileInput && uploadMessage) {
          fileInput.value = '';
          uploadMessage.textContent = " Image téléchargée avec succès";
          uploadMessage.style.color = "green";
        }
      },
      (error) => {
        console.log(error);
  
        // Afficher un message d'erreur
        const uploadMessage = document.getElementById("upload-message") as HTMLSpanElement;
        if (uploadMessage) {
          uploadMessage.textContent = "Erreur lors du téléchargement de l'image";
          uploadMessage.style.color = "red";
        }
      }
    );
  }
}