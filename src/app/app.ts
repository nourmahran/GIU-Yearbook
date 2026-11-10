
import { Component, inject, afterNextRender } from '@angular/core';
import { RouterOutlet } from '@angular/router';

import { Header } from './components/header/header';
import { TopStrip } from './components/top-strip/top-strip';
import { AuthService } from './services/auth.service';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, Header, TopStrip],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App {
  private readonly auth = inject(AuthService);

  constructor() {
    afterNextRender(() => {
      this.auth.checkSession().subscribe({
        error: () => {}
      });
    });
  }
}
