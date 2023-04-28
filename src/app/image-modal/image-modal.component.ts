import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
  selector: 'app-image-modal',
  template: `
    <h2 mat-dialog-title>{{ data.name }}</h2>
    <mat-dialog-content>
      <img [src]="data.url" [alt]="data.name" class="modal-image" />
      <h3>{{ data.description }}</h3>
      <h3>{{ data.tags }}</h3>

    </mat-dialog-content>
    <mat-dialog-actions>
      <button mat-button (click)="onClose()">Fermer</button>
    </mat-dialog-actions>
  `,
})
export class ImageModalComponent {
  constructor(
    public dialogRef: MatDialogRef<ImageModalComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {}

  onClose(): void {
    this.dialogRef.close();
  }
}