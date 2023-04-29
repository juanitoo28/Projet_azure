import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-image-modal',
  templateUrl: './image-modal.component.html',
  styleUrls: ['./image-modal.component.scss']
})
export class ImageModalComponent {
  constructor(
    private http: HttpClient,
    public dialogRef: MatDialogRef<ImageModalComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {}

  onClose(): void {
    this.dialogRef.close();
  }

  // onDelete(imageName: string): void {
  //   this.http.delete(`/delete_image/${imageName}`).subscribe(
  //     (response) => {
  //       console.log('Image supprimée avec succès');
  //       // Fermez la fenêtre modale et actualisez la liste des images si nécessaire
  //     },
  //     (error) => {
  //       console.error('Erreur lors de la suppression de l\'image');
  //     }
  //   );
  //   this.dialogRef.close('delete');
  // }
  onDelete(imageName: string): void {
    this.http.delete(`/delete_image/${imageName}`).subscribe(
      (response) => {
        console.log('Image supprimée avec succès');
        // Fermez la fenêtre modale et actualisez la liste des images si nécessaire
      },
      (error) => {
        console.error('Erreur lors de la suppression de l\'image');
      }
    );
    this.dialogRef.close('delete');
  }
  
}
