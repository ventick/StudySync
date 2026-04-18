import { CommonModule, DatePipe } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { GroupFormPayload, StudyGroup, Subject } from '../models/api.models';
import { AuthService } from '../services/auth.service';
import { GroupsService } from '../services/groups.service';
import { SubjectsService } from '../services/subjects.service';

@Component({
  selector: 'app-group-detail-page',
  imports: [CommonModule, DatePipe, FormsModule, RouterLink],
  template: `
    @if (group) {
      <section class="layout">
        <article class="panel">
          <div class="panel__head">
            <div>
              <p class="eyebrow">{{ group.subject_details?.code ?? 'SUBJ' }}</p>
              <h1>{{ group.title }}</h1>
              <p class="description">{{ group.description }}</p>
            </div>
            <a class="link-button" routerLink="/groups">Back</a>
          </div>

          <div class="meta">
            <span>Creator: {{ group.creator_name }}</span>
            <span>Members: {{ group.member_count ?? 0 }}/{{ group.max_members }}</span>
            <span>Created: {{ group.created_at | date: 'short' }}</span>
          </div>

          <div class="button-row">
            @if (!isCreator() && !isMember()) {
              <button type="button" class="primary-button" (click)="joinGroup()">Join group</button>
            }
            @if (!isCreator() && isMember()) {
              <button type="button" class="secondary-button" (click)="leaveGroup()">Leave group</button>
            }
            @if (isCreator()) {
              <button type="button" class="secondary-button" (click)="toggleEdit()">
                {{ isEditing ? 'Cancel edit' : 'Edit group' }}
              </button>
              <button type="button" class="danger-button" (click)="deleteGroup()">Delete group</button>
            }
          </div>

          @if (statusMessage) {
            <p class="success">{{ statusMessage }}</p>
          }

          @if (errorMessage) {
            <p class="error">{{ errorMessage }}</p>
          }
        </article>

        @if (isEditing) {
          <article class="panel">
            <p class="eyebrow">Edit</p>
            <h2>Edit group</h2>

            <form class="form" (ngSubmit)="saveGroup()">
              <label>
                Group title
                <input [(ngModel)]="editForm.title" name="title" type="text" required />
              </label>

              <label>
                Description
                <textarea [(ngModel)]="editForm.description" name="description" rows="4" required></textarea>
              </label>

              <label>
                Subject
                <select [(ngModel)]="editForm.subject" name="subject" required>
                  @for (subject of subjects; track subject.id) {
                    <option [ngValue]="subject.id">{{ subject.code }} - {{ subject.name }}</option>
                  }
                </select>
              </label>

              <label>
                Max members
                <input [(ngModel)]="editForm.max_members" name="max_members" type="number" min="2" required />
              </label>

              <button type="submit" class="primary-button">Save changes</button>
            </form>
          </article>
        }

        <article class="panel">
          <p class="eyebrow">Members</p>
          <h2>Current participants</h2>

          @if (!group.members || group.members.length === 0) {
            <p class="description">No members found yet.</p>
          } @else {
            <div class="member-list">
              @for (member of group.members; track member.id) {
                <div class="member-item">
                  <div>
                    <strong>{{ member.username }}</strong>
                    <span>Joined {{ member.joined_at | date: 'shortDate' }}</span>
                  </div>
                  @if (isCreator() && member.user !== currentUserId() && member.user !== group.creator) {
                    <button type="button" class="danger-button" (click)="removeMember(member.user)">Remove</button>
                  }
                </div>
              }
            </div>
          }
        </article>
      </section>
    } @else {
      <p class="muted">Loading group details...</p>
    }
  `,
  styles: [`
    .layout { display: grid; gap: 1rem; }
    .panel { background: rgba(255,255,255,.82); border: 1px solid rgba(20,48,79,.12); border-radius: 24px; padding: 1.5rem; box-shadow: 0 18px 40px rgba(20,48,79,.08); }
    .panel__head, .meta, .button-row, .member-item { display: flex; justify-content: space-between; gap: 1rem; flex-wrap: wrap; }
    .eyebrow { margin: 0 0 .5rem; color: #b14e19; font-weight: 700; text-transform: uppercase; letter-spacing: .08em; }
    h1, h2 { margin: 0 0 .6rem; }
    .description, .meta, .member-item span, .muted { color: #5a6a7f; line-height: 1.6; }
    .button-row { margin-top: 1rem; }
    .primary-button, .secondary-button, .danger-button, .link-button {
      border-radius: 999px; padding: .85rem 1.15rem; font-weight: 700; cursor: pointer; border: 0; text-decoration: none;
    }
    .primary-button { background: #da6b2d; color: #fff; }
    .secondary-button, .link-button { background: #fff; color: #14304f; border: 1px solid rgba(20,48,79,.12); }
    .danger-button { background: #b42318; color: #fff; }
    .form { display: grid; gap: 1rem; }
    label { display: grid; gap: .45rem; font-weight: 600; }
    input, textarea, select { border-radius: 16px; border: 1px solid rgba(20,48,79,.14); padding: .95rem 1rem; font: inherit; background: #fff; }
    .member-list { display: grid; gap: .75rem; }
    .member-item { align-items: center; padding: .9rem 1rem; border: 1px solid rgba(20,48,79,.1); border-radius: 18px; background: rgba(255,255,255,.7); }
    .success { color: #067647; font-weight: 700; margin: 1rem 0 0; }
    .error { color: #b42318; font-weight: 700; margin: 1rem 0 0; }
  `]
})
export class GroupDetailPageComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly groupsService = inject(GroupsService);
  private readonly subjectsService = inject(SubjectsService);
  private readonly authService = inject(AuthService);

  protected group: StudyGroup | null = null;
  protected subjects: Subject[] = [];
  protected errorMessage = '';
  protected statusMessage = '';
  protected isEditing = false;
  protected readonly editForm: GroupFormPayload = {
    title: '',
    description: '',
    subject: null,
    max_members: 3
  };

  constructor() {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.loadGroup(id);
    this.subjectsService.listSubjects().subscribe({
      next: (subjects) => (this.subjects = subjects),
      error: () => {}
    });
  }

  protected currentUserId(): number | null {
    return this.authService.currentUserValue?.id ?? null;
  }

  protected isCreator(): boolean {
    return this.group?.creator === this.currentUserId();
  }

  protected isMember(): boolean {
    return !!this.group?.members?.some((member) => member.user === this.currentUserId());
  }

  protected toggleEdit(): void {
    if (!this.group) {
      return;
    }

    this.isEditing = !this.isEditing;
    this.statusMessage = '';
    this.errorMessage = '';
    if (this.isEditing) {
      this.editForm.title = this.group.title;
      this.editForm.description = this.group.description;
      this.editForm.subject = this.group.subject;
      this.editForm.max_members = this.group.max_members;
    }
  }

  protected saveGroup(): void {
    if (!this.group) {
      return;
    }

    this.groupsService.updateGroup(this.group.id, this.editForm).subscribe({
      next: (group) => {
        this.group = group;
        this.isEditing = false;
        this.statusMessage = 'Group updated successfully.';
        this.errorMessage = '';
      },
      error: (error) => {
        this.errorMessage = error?.error?.error ?? 'Could not update the group.';
      }
    });
  }

  protected joinGroup(): void {
    if (!this.group) {
      return;
    }

    this.groupsService.joinGroup(this.group.id).subscribe({
      next: () => {
        this.statusMessage = 'You joined the group.';
        this.errorMessage = '';
      },
      error: (error) => {
        this.errorMessage = error?.error?.error ?? 'Could not join the group.';
      }
    });
  }

  protected leaveGroup(): void {
    if (!this.group) {
      return;
    }

    this.groupsService.leaveGroup(this.group.id).subscribe({
      next: () => {
        this.statusMessage = 'You left the group.';
        this.errorMessage = '';
      },
      error: (error) => {
        this.errorMessage = error?.error?.error ?? 'Could not leave the group.';
      }
    });
  }

  protected removeMember(userId: number): void {
    if (!this.group) {
      return;
    }

    this.groupsService.removeMember(this.group.id, userId).subscribe({
      next: () => {
        this.statusMessage = 'Member removed successfully.';
        this.errorMessage = '';
      },
      error: (error) => {
        this.errorMessage = error?.error?.error ?? 'Could not remove the member.';
      }
    });
  }

  protected deleteGroup(): void {
    if (!this.group) {
      return;
    }

    this.groupsService.deleteGroup(this.group.id).subscribe({
      next: () => this.router.navigate(['/groups']),
      error: (error) => {
        this.errorMessage = error?.error?.error ?? 'Could not delete the group.';
      }
    });
  }

  private loadGroup(id: number): void {
    this.groupsService.getGroup(id).subscribe({
      next: (group) => {
        this.group = group;
      },
      error: (error) => {
        this.errorMessage = error?.error?.error ?? 'Could not load group details.';
      }
    });
  }
}
