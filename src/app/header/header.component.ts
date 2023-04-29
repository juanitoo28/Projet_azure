import { Component } from '@angular/core';
import { SharedService } from '../shared.service';
import { HttpClient } from '@angular/common/http'; // Importez HttpClient

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
})
export class HeaderComponent {
  constructor(
    private sharedService: SharedService,
    private http: HttpClient // Injectez HttpClient
  ) {}

  filterImages(event: KeyboardEvent): void {
    const target = event.target as HTMLInputElement;
    const searchText = target?.value || '';
    this.sharedService.setSearchText(searchText);
  }

  startListening(): void {
    navigator.mediaDevices
      .getUserMedia({ audio: true })
      .then((stream) => {
        const mediaRecorder = new MediaRecorder(stream);
        mediaRecorder.start();

        const audioChunks: Blob[] = [];
        mediaRecorder.addEventListener('dataavailable', (event) => {
          audioChunks.push(event.data);
        });

        mediaRecorder.addEventListener('stop', () => {
          const audioBlob = new Blob(audioChunks, {
            type: 'audio/webm',
          });

          // Remplacez l'URL par l'URL de votre serveur Django
          const apiUrl = 'http://localhost:8000/azure_speech_to_text/';

          const formData = new FormData();
          formData.append('audio_data', audioBlob, 'audio.webm');

          this.http.post<{ transcript: string }>(apiUrl, formData).subscribe(
            (response) => {
              this.sharedService.setSearchText(response.transcript);
            },
            (error) => {
              console.error('Error:', error);
            }
          );
        });

        setTimeout(() => {
          mediaRecorder.stop();
        }, 3000);
      })
      .catch((err) => {
        console.error('Error:', err);
      });
  }
}
