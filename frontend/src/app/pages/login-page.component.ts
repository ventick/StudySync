import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-login-page',
  imports: [CommonModule, FormsModule],
  template: `
    <section class="panel auth">
      <div>
        <p class="eyebrow">Student Login</p>
        <h1>Welcome back</h1>
        <p class="description">Sign in to browse study groups, create your own group, and manage memberships.</p>
      </div>

      <form class="form" (ngSubmit)="login()">
        <label>
          Username
          <input [(ngModel)]="username" name="username" type="text" required />
        </label>

        <label>
          Password
          <input [(ngModel)]="password" name="password" type="password" required />
        </label>

        @if (errorMessage) {
          <p class="error">{{ errorMessage }}</p>
        }

        <button type="submit" [disabled]="isSubmitting">
          {{ isSubmitting ? 'Signing in...' : 'Login' }}
        </button>
      </form>
    </section>
  `,
  styles: [`
    .panel {
      max-width: 42rem;
      margin: 4rem auto;
      padding: 2rem;
      border-radius: 24px;
      background: rgba(255,255,255,.82);
      border: 1px solid rgba(20,48,79,.12);
      box-shadow: 0 18px 40px rgba(20,48,79,.08);
    }
    .auth { display: grid; gap: 1.5rem; }
    .eyebrow { margin: 0 0 .75rem; color: #b14e19; font-weight: 700; text-transform: uppercase; letter-spacing: .08em; }
    h1 { margin: 0 0 .5rem; font-size: clamp(2rem, 6vw, 3rem); }
    .description { margin: 0; color: #5a6a7f; line-height: 1.6; }
    .form { display: grid; gap: 1rem; }
    label { display: grid; gap: .45rem; font-weight: 600; color: #14304f; }
    input {
      border-radius: 16px; border: 1px solid rgba(20,48,79,.14); padding: .95rem 1rem;
      font: inherit; background: #fff;
    }
    button {
      justify-self: start; border: 0; border-radius: 999px; padding: .9rem 1.4rem;
      background: #da6b2d; color: #fff; font-weight: 700; cursor: pointer;
    }
    .error { margin: 0; color: #b42318; font-weight: 600; }
  `]
})
export class LoginPageComponent {
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  protected username = '';
  protected password = '';
  protected errorMessage = '';
  protected isSubmitting = false;

  protected login(): void {
    this.errorMessage = '';
    this.isSubmitting = true;

    this.authService.login(this.username, this.password).subscribe({
      next: () => {
        this.isSubmitting = false;
        this.router.navigate(['/groups']);
      },
      error: (error) => {
        this.isSubmitting = false;
        this.errorMessage = error?.error?.error ?? 'Login failed. Please check your credentials.';
      }
    });
  }
}
