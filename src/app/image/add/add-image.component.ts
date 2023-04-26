import { Component } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';

@Component({
  selector: 'app-add-image',
  templateUrl: './add-image.component.html',
  styleUrls: ['./add-image.component.scss']
})
export class AddImageComponent {
  title: string;
  description: string;
  url: string;
  image_file: File;

  constructor(private http: HttpClient, private router: Router) { }

  onSubmit() {
    const formData = new FormData();
    formData.append('title', this.title);
    formData.append('description', this.description);
    formData.append('url', this.url);
    formData.append('image_file', this.image_file);
    this.http.post('/api/images', formData).subscribe((data: any) => {
      this.router.navigate(['/images', data.id]);
    });
  }

  onFileChange(event: any) {
    this.image_file = event.target.files[0];
  }
}
