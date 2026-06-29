import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../core/auth.service';
import { ToastService } from '../../core/toast.service';

@Component({
  selector: 'app-login-page',
  imports: [ReactiveFormsModule],
  templateUrl: './login.page.html',
})
export class LoginPage {
  private readonly fb = inject(FormBuilder);
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  private readonly toast = inject(ToastService);

  readonly error = signal('');
  readonly form = this.fb.nonNullable.group({
    email: ['admin@xcportfolio.dev', [Validators.required, Validators.email]],
    password: ['Admin123!', Validators.required],
  });

  async submit(): Promise<void> {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const { email, password } = this.form.getRawValue();

    try {
      await this.auth.login(email, password);
      this.toast.success('Sesion iniciada.');
      this.router.navigateByUrl('/');
    } catch {
      this.error.set('Credenciales invalidas para el modo local.');
      this.toast.error('No se pudo iniciar sesion.');
    }
  }
}
