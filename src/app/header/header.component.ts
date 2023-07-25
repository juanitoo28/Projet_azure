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
  isListening: boolean = false;
  isSearching: boolean = false;
  isConverting: boolean = false;
  private audioStream: MediaStream | null = null; 
  searchTextChangedSubscription: Subscription = new Subscription();
  constructor(
    private sharedService: SharedService,
    private http: HttpClient,
  ) {}

  ngOnInit(): void {
    this.searchTextChangedSubscription = this.sharedService.searchTextChanged.subscribe(
      (text) => {
        this.searchText = text;
      }
    );
    navigator.mediaDevices
      .getUserMedia({ audio: true })
      .then((stream) => {
        this.audioStream = stream;  // MODIFIÉE
      })
      .catch((err) => {
        console.error('Error:', err);
      });
  }

  ngOnDestroy(): void {
    this.searchTextChangedSubscription.unsubscribe();
    if (this.audioStream) {
      this.audioStream.getTracks().forEach((track) => track.stop());
    }
  }

  // Ancienne recherche:
  // filterImages(event: Event): void {
  //   const target = event.target as HTMLInputElement;
  //   const searchText = target?.value || '';
  //   this.sharedService.setSearchText(searchText);
  // }

  searchImages(): void {
    const searchText = this.searchText.trim(); 
    if (searchText === '') {
      this.clearSearch();
    } else {
      this.sharedService.setSearchText(searchText);
    }
  }

  onInput(): void {
    if (this.searchText.trim() === '') {
      this.sharedService.setSearchText('');
    }
  }
    

  clearSearch(): void {
    this.searchText = ''; // Efface le texte de recherche
    this.sharedService.setSearchText(''); // Effectue la recherche avec une chaîne vide pour afficher toutes les images
    // Vous pouvez également appeler la fonction de recherche ici si vous ne voulez pas que l'utilisateur ait à cliquer sur le bouton de recherche après avoir effacé le texte
    // this.searchImages();
  }
  // Ajoutez une nouvelle souscription pour surveiller les changements de texte de recherche
private searchTextSubscription: Subscription = new Subscription();
private mediaRecorder: MediaRecorder | null = null;

startListening(): void {
  navigator.mediaDevices
    .getUserMedia({ audio: true })
    .then((stream) => {
      if (!this.audioStream) {
        console.error('Audio stream not initialized');
        return;
      }
      this.isListening = true;
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

        this.isConverting = true; 

        this.http.post<{ transcript: string }>(apiUrl, formData).subscribe(
          (response) => {
            const transcript = response.transcript.replace(/\.$/, '');
            this.sharedService.setSearchText(transcript);
            this.isConverting = false; 
            this.isListening = false; 
            this.isSearching = false; 
          },
          (error) => {
            console.error('Error:', error);
            this.isListening = false; 
            this.isSearching = false; 
          }
        );
      });

      setTimeout(() => {
        mediaRecorder.stop();
        this.isSearching = true;
      }, 3000);
    })
    .catch((err) => {
      console.error('Error:', err);
    });
}


stopListening(): void {
  if (this.mediaRecorder && this.mediaRecorder.state !== 'inactive') {
    this.mediaRecorder.stop();
    this.isListening = false;
    this.isSearching = false;
    // Annulez l'abonnement lorsque l'enregistrement est terminé
    this.searchTextSubscription.unsubscribe();
  }
}

}
