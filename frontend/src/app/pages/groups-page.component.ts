import { CommonModule, DatePipe } from '@angular/common';
import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { GroupsService } from '../services/groups.service';
import { StudyGroup } from '../models/api.models';

@Component({
  selector: 'app-groups-page',
  imports: [CommonModule, RouterLink, DatePipe],
  template: `
    <section class="section-head">
      <div>
        <p class="eyebrow">Study Groups</p>
        <h1>Find your next study buddy</h1>
        <p class="description">Browse active subject-based groups and join the ones that match your schedule.</p>
      </div>
      <button class="primary-button" type="button" routerLink="/groups/new">Create Group</button>
    </section>

    <div class="actions">
      <button class="secondary-button" type="button" (click)="loadGroups()">Refresh groups</button>
    </div>

    @if (errorMessage) {
      <p class="error-banner">{{ errorMessage }}</p>
    }

    @if (isLoading) {
      <p class="muted">Loading groups...</p>
    } @else if (groups.length === 0) {
      <section class="empty-state">
        <h2>No groups yet</h2>
        <p>Create the first study group and invite classmates to join.</p>
      </section>
    } @else {
      <section class="grid">
        @for (group of groups; track group.id) {
          <article class="card">
            <div class="card__meta">
              <span>{{ group.subject_details?.code ?? 'SUBJ' }}</span>
              <span>{{ group.member_count }}/{{ group.max_members }} members</span>
            </div>
            <h2>{{ group.title }}</h2>
            <p>{{ group.description }}</p>
            <div class="card__footer">
              <span>By {{ group.creator_name }}</span>
              <span>{{ group.created_at | date: 'shortDate' }}</span>
            </div>
            <button class="primary-button" type="button" [routerLink]="['/groups', group.id]">Open details</button>
          </article>
        }
      </section>
    }
  `,
  styles: [`
    .section-head, .actions { display: flex; justify-content: space-between; align-items: end; gap: 1rem; margin-bottom: 1rem; flex-wrap: wrap; }
    .eyebrow { margin: 0 0 .5rem; color: #b14e19; font-weight: 700; text-transform: uppercase; letter-spacing: .08em; }
    h1 { margin: 0; font-size: clamp(2rem, 6vw, 3.2rem); }
    .description { margin: .7rem 0 0; color: #5a6a7f; line-height: 1.6; max-width: 42rem; }
    .grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(260px, 1fr)); gap: 1rem; }
    .card, .empty-state { background: rgba(255,255,255,.82); border: 1px solid rgba(20,48,79,.12); border-radius: 24px; padding: 1.5rem; box-shadow: 0 18px 40px rgba(20,48,79,.08); }
    .card__meta, .card__footer { display: flex; justify-content: space-between; gap: 1rem; color: #5a6a7f; font-size: .92rem; }
    .card h2 { margin: .9rem 0 .65rem; font-size: 1.35rem; }
    .card p { margin: 0 0 1rem; color: #30455f; line-height: 1.6; min-height: 4.8rem; }
    .card__footer { margin: 0 0 1rem; }
    .primary-button, .secondary-button {
      border: 0; border-radius: 999px; padding: .9rem 1.2rem; font-weight: 700; cursor: pointer; text-decoration: none;
    }
    .primary-button { background: #da6b2d; color: #fff; }
    .secondary-button { background: #fff; color: #14304f; border: 1px solid rgba(20,48,79,.12); }
    .error-banner { margin: 0 0 1rem; padding: .85rem 1rem; border-radius: 14px; background: #fde8e8; color: #b42318; font-weight: 600; }
    .muted { color: #5a6a7f; }
  `]
})
export class GroupsPageComponent {
  private readonly groupsService = inject(GroupsService);

  protected groups: StudyGroup[] = [];
  protected isLoading = true;
  protected errorMessage = '';

  constructor() {
    this.loadGroups();
  }

  protected loadGroups(): void {
    this.isLoading = true;
    this.errorMessage = '';

    this.groupsService.listGroups().subscribe({
      next: (groups) => {
        this.groups = groups;
        this.isLoading = false;
      },
      error: (error) => {
        this.errorMessage = error?.error?.error ?? 'Could not load groups from the API.';
        this.isLoading = false;
      }
    });
  }
}
