import { Component, computed, inject, signal } from '@angular/core';
import { NgIf } from '@angular/common';
import { RouterLink, RouterLinkActive, Router, NavigationEnd } from '@angular/router';

@Component({
  selector: 'app-bottom-nav',
  imports: [RouterLink, RouterLinkActive, NgIf],
  template: `
    <nav
      *ngIf="!hideNav()"
      aria-label="Bottom Navigation"
      class="fixed bottom-0 left-0 right-0 z-[1000] flex min-h-14 items-center justify-around gap-2 border-t border-border bg-background px-4 py-3 shadow-[0_-2px_10px_rgba(0,0,0,0.1)] md:justify-center md:gap-5 md:px-5"
    >
      <a
        routerLink="/diary/daily"
        routerLinkActive="text-[color:var(--primary)] bg-[color:color-mix(in_srgb,_var(--primary)_10%,_transparent)]"
        aria-label="Diary"
        class="flex max-w-20 flex-1 min-h-11 flex-col items-center justify-center rounded-[var(--radius)] px-2 text-xs font-medium text-[color:var(--text-muted)] transition-colors hover:text-[color:var(--text)] md:min-w-[100px] md:max-w-[120px] md:text-sm"
      >
        Diary
      </a>
      <a
        routerLink="/log"
        routerLinkActive="text-[color:var(--primary)] bg-[color:color-mix(in_srgb,_var(--primary)_10%,_transparent)]"
        aria-label="Log"
        class="flex max-w-20 flex-1 min-h-11 flex-col items-center justify-center rounded-[var(--radius)] px-2 text-xs font-medium text-[color:var(--text-muted)] transition-colors hover:text-[color:var(--text)] md:min-w-[100px] md:max-w-[120px] md:text-sm"
      >
        Log
      </a>
      <a
        routerLink="/dashboard"
        routerLinkActive="text-[color:var(--primary)] bg-[color:color-mix(in_srgb,_var(--primary)_10%,_transparent)]"
        aria-label="Dashboard"
        class="flex max-w-20 flex-1 min-h-11 flex-col items-center justify-center rounded-[var(--radius)] px-2 text-xs font-medium text-[color:var(--text-muted)] transition-colors hover:text-[color:var(--text)] md:min-w-[100px] md:max-w-[120px] md:text-sm"
      >
        Dashboard
      </a>
    </nav>
  `,
  styles: ``
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
