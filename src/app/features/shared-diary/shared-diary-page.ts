import { Component, computed, inject, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { EntryCard } from '../../shared/entry-card/entry-card';
import { SharedDiaryService } from '../../core/shared-diary.service';
import { FoodEntry } from '../../core/models';

@Component({
  selector: 'app-shared-diary-page',
  imports: [CommonModule, EntryCard],
  template: `
    <section class="shared-diary">
      <div *ngIf="isLoading(); else diaryContent" class="loading">
        <p>Loading shared diary...</p>
      </div>

      <ng-template #diaryContent>
        <div *ngIf="sharedDiary(); else notFound">
          <header class="shared-header">
            <h2>Shared Diary</h2>
            <div class="share-info">
              <p>Shared on {{ sharedDiary()?.sharedAt | date:'medium' }}</p>
              <p class="expires">Expires on {{ sharedDiary()?.expiresAt | date:'medium' }}</p>
            </div>
          </header>

          <div class="stats">
            <div class="stat-card">
              <h3>{{ totalEntries() }}</h3>
              <p>Total Entries</p>
            </div>
            <div class="stat-card">
              <h3>{{ foodEntries().length }}</h3>
              <p>Food Items</p>
            </div>
            <div class="stat-card">
              <h3>{{ drinkEntries().length }}</h3>
              <p>Drink Items</p>
            </div>
          </div>

          <div class="entries-section">
            <h3>Recent Entries</h3>
            <div class="entries-grid" *ngIf="totalEntries() > 0; else noEntries">
              <app-entry-card
                *ngFor="let entry of (sharedDiary()?.entries || []).slice(0, 20)"
                [entry]="entry"
              />
            </div>
            <ng-template #noEntries>
              <p class="no-entries">No entries in this shared diary.</p>
            </ng-template>
          </div>
        </div>

        <ng-template #notFound>
          <div class="not-found">
            <h2>Diary Not Found</h2>
            <p>This shared diary link is invalid or has expired.</p>
            <a routerLink="/dashboard" class="back-link">Back to Dashboard</a>
          </div>
        </ng-template>
      </ng-template>
    </section>
  `,
  styles: `
    .shared-diary {
      min-height: 100vh;
      background: var(--background);
      padding: var(--space-4);
    }

    .loading {
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: 50vh;
      color: var(--text-muted);
    }

    .shared-header {
      text-align: center;
      margin-bottom: var(--space-6);
      padding-bottom: var(--space-4);
      border-bottom: 1px solid var(--border);
    }

    h2 {
      font-size: 28px;
      font-weight: 600;
      margin-bottom: var(--space-3);
      color: var(--text);
    }

    .share-info {
      color: var(--text-muted);
      font-size: 14px;
    }

    .expires {
      color: var(--warning, #f59e0b);
      font-weight: 500;
    }

    .stats {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
      gap: var(--space-4);
      margin-bottom: var(--space-6);
    }

    .stat-card {
      background: var(--card);
      border: 1px solid var(--border);
      border-radius: var(--radius-lg);
      padding: var(--space-4);
      text-align: center;
    }

    .stat-card h3 {
      font-size: 24px;
      font-weight: 700;
      color: var(--primary);
      margin: 0 0 var(--space-1) 0;
    }

    .stat-card p {
      margin: 0;
      font-size: 14px;
      color: var(--text-muted);
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    .entries-section h3 {
      font-size: 20px;
      font-weight: 600;
      margin-bottom: var(--space-4);
      color: var(--text);
    }

    .entries-grid {
      display: grid;
      gap: var(--space-3);
      margin-bottom: var(--space-6);
    }

    .no-entries {
      text-align: center;
      color: var(--text-muted);
      padding: var(--space-6);
      background: var(--muted);
      border-radius: var(--radius);
    }

    .not-found {
      text-align: center;
      padding: var(--space-8);
    }

    .not-found h2 {
      color: var(--error, #ef4444);
      margin-bottom: var(--space-3);
    }

    .not-found p {
      color: var(--text-muted);
      margin-bottom: var(--space-4);
    }

    .back-link {
      display: inline-block;
      background: var(--primary);
      color: white;
      padding: 12px 24px;
      border-radius: var(--radius);
      text-decoration: none;
      font-weight: 500;
      transition: background-color 0.2s;
    }

    .back-link:hover {
      background: color-mix(in srgb, var(--primary) 90%, black);
    }

    /* Desktop styles */
    @media (min-width: 768px) {
      .shared-diary {
        padding: var(--space-5);
        max-width: 1200px;
        margin: 0 auto;
      }

      h2 {
        font-size: 32px;
      }

      .stats {
        grid-template-columns: repeat(3, 1fr);
      }

      .stat-card h3 {
        font-size: 32px;
      }

      .entries-grid {
        grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
      }
    }
  `
})
export class SharedDiaryPage {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private sharedDiaryService = inject(SharedDiaryService);

  protected isLoading = signal(true);
  protected shareId = '';

  protected sharedDiary = computed(() => {
    const diary = this.sharedDiaryService.getSharedDiary(this.shareId);
    this.isLoading.set(false);
    return diary;
  });

  protected foodEntries = computed(() => {
    const diary = this.sharedDiary();
    return diary?.entries.filter(e => e.foodDrinkType === 'food') || [];
  });

  protected drinkEntries = computed(() => {
    const diary = this.sharedDiary();
    return diary?.entries.filter(e => e.foodDrinkType === 'drink') || [];
  });

  protected totalEntries = computed(() => {
    const diary = this.sharedDiary();
    return diary?.entries?.length ?? 0;
  });

  constructor() {
    this.route.paramMap.subscribe(map => {
      this.shareId = map.get('shareId') ?? '';
      this.isLoading.set(true);

      if (!this.shareId) {
        this.router.navigate(['/dashboard']);
      }
    });
  }
}
