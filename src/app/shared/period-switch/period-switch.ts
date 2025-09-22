import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';

@Component({
  selector: 'app-period-switch',
  imports: [RouterLink, RouterLinkActive],
  template: `
    <div class="switch" role="tablist" aria-label="Period switch">
      <a routerLink="/diary/daily" routerLinkActive="active" role="tab">Daily</a>
      <a routerLink="/diary/weekly" routerLinkActive="active" role="tab">Weekly</a>
      <a routerLink="/diary/monthly" routerLinkActive="active" role="tab">Monthly</a>
    </div>
  `,
  styles: `
    .switch {
      display:flex; gap: var(--space-1); background:#f4f4f5; padding:var(--space-1);
      border-radius:999px;
    }
    a {
      padding:var(--space-2) var(--space-3); border-radius:999px; text-decoration:none;
      color:var(--text-muted); font-size:14px; font-weight:500; transition: all 0.2s;
    }
    a.active {
      background:var(--background); box-shadow:0 1px 3px rgba(0,0,0,0.1);
      color:var(--text);
    }
    a:hover { color:var(--text); }

    /* Desktop styles */
    @media (min-width: 768px) {
      .switch {
        gap: var(--space-2);
        padding: var(--space-2);
      }
      a {
        padding: var(--space-3) var(--space-4);
        font-size: 16px;
      }
    }
  `
})
export class PeriodSwitch {

}
