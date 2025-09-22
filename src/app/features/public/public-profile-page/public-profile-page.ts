import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { EntryCard } from '../../../shared/entry-card/entry-card';
import { LocalDataService } from '../../../core/local-data.service';

@Component({
  selector: 'app-public-profile-page',
  imports: [CommonModule, EntryCard],
  template: `
    <section class="public">
      <h2>@{{ slug }}</h2>
      <div class="list" *ngIf="(data.entries()).length; else empty">
        <app-entry-card *ngFor="let e of data.entries()" [entry]="e" />
      </div>
      <ng-template #empty>
        <p>No public entries yet.</p>
      </ng-template>
    </section>
  `,
  styles: `
    .public {
      padding: var(--space-4);
      text-align: center;
    }
    h2 {
      font-size: 24px;
      font-weight: 600;
      margin-bottom: var(--space-3);
      color: var(--text);
    }
    .list {
      display: flex;
      flex-direction: column;
      gap: var(--space-2);
      margin-top: var(--space-5);
    }
    p {
      font-size: 16px;
      color: var(--text-muted);
      margin-top: var(--space-5);
    }

    /* Desktop styles */
    @media (min-width: 768px) {
      .public {
        padding: var(--space-5);
      }
      h2 {
        font-size: 32px;
        margin-bottom: var(--space-4);
      }
      .list {
        margin-top: var(--space-5);
        gap: var(--space-3);
      }
      p {
        font-size: 18px;
      }
    }
  `
})
export class PublicProfilePage {
  protected slug = '';
  constructor(route: ActivatedRoute, protected data: LocalDataService) {
    route.paramMap.subscribe(map => this.slug = map.get('slug') ?? '');
  }
}
