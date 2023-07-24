import { Component, OnInit, OnDestroy } from '@angular/core';
import { SharedService } from '../shared.service';
import { HttpClient } from '@angular/common/http';
import { Subscription } from 'rxjs';
import { HomeComponent } from '../home/home.component';


@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
})
export class HeaderComponent implements OnInit, OnDestroy {
  searchText = '';
  
  searchTextChangedSubscription: Subscription = new Subscription();
  constructor(
    private sharedService: SharedService,
    private http: HttpClient
  ) {}

  ngOnInit(): void {
    this.searchTextChangedSubscription = this.sharedService.searchTextChanged.subscribe(
      (text) => {
        this.searchText = text;
      }
    );
  }

  ngOnDestroy(): void {
    this.searchTextChangedSubscription.unsubscribe();
  }

  // Ancienne recherche:
  // filterImages(event: Event): void {
  //   const target = event.target as HTMLInputElement;
  //   const searchText = target?.value || '';
  //   this.sharedService.setSearchText(searchText);
  // }

  searchImages(): void {
    const searchText = this.searchText.trim(); // Assurez-vous de supprimer les espaces inutiles
    this.sharedService.setSearchText(searchText);
  }

  clearSearch(): void {
    this.searchText = ''; // Efface le texte de recherche
    this.sharedService.setSearchText(''); // Effectue la recherche avec une chaîne vide pour afficher toutes les images
    // Vous pouvez également appeler la fonction de recherche ici si vous ne voulez pas que l'utilisateur ait à cliquer sur le bouton de recherche après avoir effacé le texte
    // this.searchImages();
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
              const transcript = response.transcript.replace(/\.$/, '');
              this.sharedService.setSearchText(transcript);
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
