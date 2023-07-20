// todo.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class TodoService {
  private apiUrl = 'https://quiet-spire-34784-29599753cfdf.herokuapp.com/django/api/todos/';

  constructor(private http: HttpClient) { }

  getTodos(): Observable<any> {
    return this.http.get(this.apiUrl);
  }

  addTodo(todo: any): Observable<any> {
    return this.http.post(this.apiUrl, todo);
  }

  deleteTodo(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}${id}/`);
  }
}
