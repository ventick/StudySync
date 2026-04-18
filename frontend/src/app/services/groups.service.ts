import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { GroupFormPayload, StudyGroup } from '../models/api.models';

@Injectable({ providedIn: 'root' })
export class GroupsService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = 'http://127.0.0.1:8000/api/groups';

  listGroups() {
    return this.http.get<StudyGroup[]>(`${this.apiUrl}/`);
  }

  getGroup(id: number) {
    return this.http.get<StudyGroup>(`${this.apiUrl}/${id}/`);
  }

  createGroup(payload: GroupFormPayload) {
    return this.http.post<StudyGroup>(`${this.apiUrl}/`, payload);
  }

  updateGroup(id: number, payload: GroupFormPayload) {
    return this.http.put<StudyGroup>(`${this.apiUrl}/${id}/`, payload);
  }

  deleteGroup(id: number) {
    return this.http.delete<void>(`${this.apiUrl}/${id}/`);
  }

  joinGroup(id: number) {
    return this.http.post<{ message: string }>(`${this.apiUrl}/${id}/join/`, {});
  }

  leaveGroup(id: number) {
    return this.http.post<{ message: string }>(`${this.apiUrl}/${id}/leave/`, {});
  }

  removeMember(groupId: number, userId: number) {
    return this.http.post<{ message: string }>(`${this.apiUrl}/${groupId}/remove-member/`, { user_id: userId });
  }
}
