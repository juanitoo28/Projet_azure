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
    // Remplacez "http://localhost:8000" par l'URL de votre serveur Django en production
    this.http.get<any[]>("http://localhost:8000/get_images_list").subscribe((data) => {
      console.log(data); // Ajoutez cette ligne pour afficher les données brutes
      this.images = data.map((image) => {
        // Effectuez les modifications nécessaires sur l'objet image ici, si nécessaire
        // Par exemple, si vous devez ajouter des tags ou d'autres informations
  
        return image; // Assurez-vous de retourner l'objet image à la fin
      });
    });
  }
  
  // getImages(): void {
  //   // Remplacez "http://localhost:8000" par l'URL de votre serveur Django en production
  //   this.http.get<any[]>("http://localhost:8000/get_images_list").subscribe((data) => {
  //     this.images = data.map((image) => {
  //       const tags = image.analysis.map((tag) => tag.name); // Modifiez cette ligne en fonction de la structure correcte
  //       return {
  //         name: image.name,
  //         url: image.url,
  //         tags: tags,
  //       };
  //     });
  //   });
  // }
    
  
  
  
  // getImagesList(): void {
  //   this.http.get<string[]>("http://localhost:8000/images/").subscribe(
  //     (response) => {
  //       this.images = response;
  //     },
  //     (error) => {
  //       console.log(error);
  //     }
  //   );
  // }

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

    this.http.post("http://localhost:8000/upload", formData).subscribe(
      (response) => {
        console.log(response);
      },
      (error) => {
        console.log(error);
      }
    );
  }

  onDownload(imageName: string): void {
    this.http
      .get(`http://localhost:8000/download/${imageName}`, {
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
