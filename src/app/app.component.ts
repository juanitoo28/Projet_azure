import { Component, OnInit } from "@angular/core";
import { HttpClient } from "@angular/common/http"; 
import { environment } from '../environnements/environnement';


@Component({
  selector: "app-root",
  templateUrl: "./app.component.html",
  styleUrls: ["./app.component.scss"],
})
export class AppComponent {
  images: any[] = []; // Ajoutez cette ligne pour déclarer la propriété 'images'
  // images: string[] = [];
  title = "azure-storage-demo";
  selectedFile: File | null = null;

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



  onFileSelected(event: Event): void {
    const target = event.target as HTMLInputElement;
    if (target.files) {
      this.selectedFile = target.files[0];
    }
  }

  onUpload(): void {
    if (!this.selectedFile) {
      console.log("No file selected");
      return;
    }
    const formData = new FormData();
    formData.append("image", this.selectedFile, this.selectedFile.name);
    const API_URL = environment.apiUrl;
    this.http.post(`${API_URL}/upload`, formData).subscribe(
      (response) => {
        console.log(response);
        this.getImages();
  
        // Effacer le champ du nom de l'image et afficher un message de succès
        const fileInput = document.getElementById("file-input") as HTMLInputElement;
        const uploadMessage = document.getElementById("upload-message") as HTMLSpanElement;
        if (fileInput && uploadMessage) {
          fileInput.value = '';
          uploadMessage.textContent = " Image téléchargée avec succès";
          uploadMessage.style.color = "green";
        }
      },
      (error) => {
        console.log(error);
  
        // Afficher un message d'erreur
        const uploadMessage = document.getElementById("upload-message") as HTMLSpanElement;
        if (uploadMessage) {
          uploadMessage.textContent = "Erreur lors du téléchargement de l'image";
          uploadMessage.style.color = "red";
        }
      }
    );
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



// import { Component } from '@angular/core';

// @Component({
//   selector: 'app-root',
//   templateUrl: './app.component.html',
//   styleUrls: ['./app.component.scss']
// })
// export class AppComponent {
//   title = 'angularAzure';
// }
// app.component.ts



// import { Component } from '@angular/core';
// import { TodoService } from './todo.service';

// @Component({
//   selector: 'app-root',
//   templateUrl: './app.component.html',
//   styleUrls: ['./app.component.scss']
// })
// export class AppComponent {
//   title = 'monprojetangular';
//   todos: any[] = [];

//   constructor(private todoService: TodoService) {
//     this.getTodos();
//   }

//   getTodos(): void {
//     this.todoService.getTodos().subscribe((todos) => {
//       this.todos = todos;
//     });
//   }

//   addTodo(): void {
//     const newTodo = { titre: 'New Todo', description: 'A new todo item' };
//     this.todoService.addTodo(newTodo).subscribe((todo) => {
//       this.todos.push(todo);
//     });
//   }

//   deleteTodo(id: number): void {
//     this.todoService.deleteTodo(id).subscribe(() => {
//       this.todos = this.todos.filter((todo) => todo.id !== id);
//     });
//   }
// }
