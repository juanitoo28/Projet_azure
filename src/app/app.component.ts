import { Component, OnInit } from "@angular/core";
import { HttpClient } from "@angular/common/http"; 

@Component({
  selector: "app-root",
  templateUrl: "./app.component.html",
  styleUrls: ["./app.component.scss"],
})
export class AppComponent {
  images: string[] = [];
  title = "azure-storage-demo";
  selectedFile: File | null = null;

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.getImagesList();
  }

  getImagesList(): void {
    this.http.get<string[]>("http://localhost:8000/images/").subscribe(
      (response) => {
        this.images = response;
      },
      (error) => {
        console.log(error);
      }
    );
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
