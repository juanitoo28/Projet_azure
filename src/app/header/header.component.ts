import { Component, OnInit, OnDestroy } from '@angular/core';
import { SharedService } from '../shared.service';
import { Subscription } from 'rxjs';
import * as sdk from 'microsoft-cognitiveservices-speech-sdk';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
})
export class HeaderComponent implements OnInit, OnDestroy {
  searchText = '';
  isListening: boolean = false;
  isConverting: boolean = false; 
  isSearching: boolean = false;
  searchTextChangedSubscription: Subscription = new Subscription();

  constructor(private sharedService: SharedService) {}

  ngOnInit(): void {
    this.searchTextChangedSubscription = this.sharedService.searchTextChanged.subscribe(
      (text) => {
        console.log('New search text:', text);
        this.searchText = text;
      }
    );
  }

  ngOnDestroy(): void {
    this.searchTextChangedSubscription.unsubscribe();
  }

  startListening(): void {
    if (this.isListening) {
      return;
    }
  
    this.isListening = true;
  
    const speechConfig = sdk.SpeechConfig.fromSubscription('26f0aa02efb842cf82756f651e8cf9ef', 'westeurope');
    const audioConfig = sdk.AudioConfig.fromDefaultMicrophoneInput();
  
    const recognizer = new sdk.SpeechRecognizer(speechConfig, audioConfig);
  
    recognizer.recognizeOnceAsync(
      (result) => {
        this.searchText = result.text.replace(/\.$/, '');  // Remove the trailing period and set the transcript to searchText
        recognizer.close();
        this.isListening = false; // Ensure isListening is set to false here
        this.isSearching = false;
      },
      (err) => {
        console.error('Error:', err);
        recognizer.close();
        this.isListening = false; // And here
        this.isSearching = false;
      }
    );
  
    setTimeout(() => {
      if (this.isListening) {
        recognizer.stopContinuousRecognitionAsync();
        this.isSearching = true;
        this.isListening = false; // And here
      }
    }, 3000);
  }
  

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
  }
}
