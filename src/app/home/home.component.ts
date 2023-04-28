import { Component } from '@angular/core';
import { HttpClient } from "@angular/common/http"; 
import { environment } from '../../environnements/environnement';
import { Router } from '@angular/router';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent {
  images: any[] = [];
  title = "azure-storage-demo";

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.getImages();
  }

  getImages(): void {
    const API_URL = environment.apiUrl;
    this.http.get<any[]>(`${API_URL}/get_images_list`).subscribe((data) => {
      console.log(data);
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

  onDownload(imageName: string): void {
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
}

