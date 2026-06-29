import { Injectable, signal } from '@angular/core';
import { ToastMessage } from './portfolio.models';

@Injectable({ providedIn: 'root' })
export class ToastService {
  readonly messages = signal<ToastMessage[]>([]);

  success(message: string): void {
    this.push('success', message);
  }

  error(message: string): void {
    this.push('error', message);
  }

  info(message: string): void {
    this.push('info', message);
  }

  dismiss(id: string): void {
    this.messages.update((messages) => messages.filter((item) => item.id !== id));
  }

  private push(type: ToastMessage['type'], message: string): void {
    const toast: ToastMessage = {
      id: crypto.randomUUID(),
      type,
      message,
    };

    this.messages.update((messages) => [...messages, toast]);
    window.setTimeout(() => this.dismiss(toast.id), 4200);
  }
}
