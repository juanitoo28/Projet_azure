import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-image-list',
  templateUrl: './app-image-list.component.html',
  styleUrls: ['./app-image-list.component.scss']
})
export class ImageListComponent implements OnInit {
  images: any[];

  constructor(private http: HttpClient) { }

  ngOnInit() {
    this.http.get('/api/images').subscribe((data: any) => {
      this.images = data.images;
    });
  }
}
