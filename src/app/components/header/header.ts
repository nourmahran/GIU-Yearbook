
import { Component, inject, signal } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';

import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-header',
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './header.html',
  styleUrl: './header.css',
})
export class Header {
  protected readonly auth = inject(AuthService);

  protected readonly navLinks = [
    { label: 'Class of 2028', path: '/', exact: true },
    { label: 'Teachers & Staff', path: '/teachers', exact: false },
    { label: 'Gallery', path: '/gallery', exact: false },
  ];

  protected readonly logoFailed = signal(false);
}
