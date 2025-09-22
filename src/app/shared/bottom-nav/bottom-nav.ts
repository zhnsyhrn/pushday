import { Component, computed, inject, signal } from '@angular/core';
import { NgIf } from '@angular/common';
import { RouterLink, RouterLinkActive, Router, NavigationEnd } from '@angular/router';

@Component({
  selector: 'app-bottom-nav',
  imports: [RouterLink, RouterLinkActive, NgIf],
  template: `
    <nav class="bottom-nav" aria-label="Bottom Navigation" *ngIf="!hideNav()">
      <a routerLink="/diary/daily" routerLinkActive="active" aria-label="Diary">Diary</a>
      <a routerLink="/log" routerLinkActive="active" aria-label="Log">Log</a>
      <a routerLink="/u/demo" routerLinkActive="active" aria-label="Public">Public</a>
    </nav>
  `,
  styles: `
    .bottom-nav {
      position: fixed;
      bottom: 0;
      left: 0;
      right: 0;
      display: flex;
      justify-content: space-around;
      align-items: center;
      gap: var(--space-2);
      border-top: 1px solid var(--border);
      background: var(--background);
      padding: var(--space-3) var(--space-4);
      box-shadow: 0 -2px 10px rgba(0,0,0,0.1);
      z-index: 1000;
      min-height: 56px;
    }
    a {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      color: var(--text-muted);
      text-decoration: none;
      font-size: 12px;
      font-weight: 500;
      padding: var(--space-2);
      border-radius: var(--radius);
      transition: all 0.2s;
      min-height: 44px;
      flex: 1;
      max-width: 80px;
    }
    a.active {
      color: var(--primary);
      background: color-mix(in srgb, var(--primary) 10%, transparent);
    }
    a:hover { color: var(--text); }

    /* Desktop styles */
    @media (min-width: 768px) {
      .bottom-nav {
        justify-content: center;
        gap: var(--space-5);
        padding: var(--space-3) var(--space-5);
      }
      a {
        font-size: 14px;
        min-width: 100px;
        max-width: 120px;
      }
    }
  `
})
export class BottomNav {
  private router = inject(Router);
  protected hideNav = signal(false);

  constructor() {
    // Initialize based on current URL
    this.hideNav.set(this.router.url.startsWith('/edit/'));
    // Update on navigation
    this.router.events.subscribe(evt => {
      if (evt instanceof NavigationEnd) {
        this.hideNav.set(evt.urlAfterRedirects.startsWith('/edit/'));
      }
    });
  }
}
