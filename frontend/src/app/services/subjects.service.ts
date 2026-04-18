import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Subject } from '../models/api.models';

@Injectable({ providedIn: 'root' })
export class SubjectsService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = 'http://127.0.0.1:8000/api/subjects/';

  listSubjects() {
    return this.http.get<Subject[]>(this.apiUrl);
  }
}
