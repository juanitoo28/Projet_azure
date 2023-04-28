import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HomeComponent } from './home/home.component';
import { AddImageComponent } from './add-image/add-image.component';
import { ListeImagesComponent } from './liste-images/liste-images.component'

const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'add-image', component: AddImageComponent },
  { path: 'app-liste-images', component: ListeImagesComponent },

];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
