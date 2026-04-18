import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { GroupFormPayload, Subject } from '../models/api.models';
import { GroupsService } from '../services/groups.service';
import { SubjectsService } from '../services/subjects.service';

@Component({
  selector: 'app-group-form-page',
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <section class="panel">
      <div class="panel__head">
        <div>
          <p class="eyebrow">New Group</p>
          <h1>Create a study group</h1>
        </div>
        <a routerLink="/groups" class="link-button">Back to groups</a>
      </div>

      <form class="form" (ngSubmit)="createGroup()">
        <label>
          Group title
          <input [(ngModel)]="form.title" name="title" type="text" required />
        </label>

        <label>
          Description
          <textarea [(ngModel)]="form.description" name="description" rows="4" required></textarea>
        </label>

        <label>
          Subject
          <select [(ngModel)]="form.subject" name="subject" required>
            <option [ngValue]="null">Choose subject</option>
            @for (subject of subjects; track subject.id) {
              <option [ngValue]="subject.id">{{ subject.code }} - {{ subject.name }}</option>
            }
          </select>
        </label>

        <label>
          Max members
          <input [(ngModel)]="form.max_members" name="max_members" type="number" min="2" required />
        </label>

        @if (errorMessage) {
          <p class="error">{{ errorMessage }}</p>
        }

        <button type="submit" [disabled]="isSubmitting">
          {{ isSubmitting ? 'Creating...' : 'Create group' }}
        </button>
      </form>
    </section>
  `,
  styles: [`
    .panel { max-width: 52rem; margin: 0 auto; padding: 1.75rem; border-radius: 24px; background: rgba(255,255,255,.82); border: 1px solid rgba(20,48,79,.12); box-shadow: 0 18px 40px rgba(20,48,79,.08); }
    .panel__head { display: flex; justify-content: space-between; gap: 1rem; align-items: start; flex-wrap: wrap; margin-bottom: 1.5rem; }
    .eyebrow { margin: 0 0 .5rem; color: #b14e19; font-weight: 700; text-transform: uppercase; letter-spacing: .08em; }
    h1 { margin: 0; font-size: clamp(1.8rem, 5vw, 2.8rem); }
    .form { display: grid; gap: 1rem; }
    label { display: grid; gap: .45rem; font-weight: 600; }
    input, textarea, select { border-radius: 16px; border: 1px solid rgba(20,48,79,.14); padding: .95rem 1rem; font: inherit; background: #fff; }
    button, .link-button { justify-self: start; border: 0; border-radius: 999px; padding: .9rem 1.2rem; background: #da6b2d; color: #fff; font-weight: 700; cursor: pointer; text-decoration: none; }
    .link-button { background: #fff; color: #14304f; border: 1px solid rgba(20,48,79,.12); }
    .error { margin: 0; color: #b42318; font-weight: 600; }
  `]
})
export class GroupFormPageComponent {
  private readonly groupsService = inject(GroupsService);
  private readonly subjectsService = inject(SubjectsService);
  private readonly router = inject(Router);

  protected readonly form: GroupFormPayload = {
    title: '',
    description: '',
    subject: null,
    max_members: 3
  };

  protected subjects: Subject[] = [];
  protected errorMessage = '';
  protected isSubmitting = false;

  constructor() {
    this.subjectsService.listSubjects().subscribe({
      next: (subjects) => (this.subjects = subjects),
      error: () => (this.errorMessage = 'Could not load subjects for the form.')
    });
  }

  protected createGroup(): void {
    this.errorMessage = '';
    this.isSubmitting = true;

    this.groupsService.createGroup(this.form).subscribe({
      next: (group) => {
        this.isSubmitting = false;
        this.router.navigate(['/groups', group.id]);
      },
      error: (error) => {
        this.isSubmitting = false;
        this.errorMessage = error?.error?.error ?? 'Group creation failed.';
      }
    });
  }
}
