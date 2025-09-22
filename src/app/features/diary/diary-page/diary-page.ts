import { Component } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { PeriodSwitch } from '../../../shared/period-switch/period-switch';
import { LocalDataService } from '../../../core/local-data.service';
import { EntryCard } from '../../../shared/entry-card/entry-card';
import { FoodEntry } from '../../../core/models';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-diary-page',
  imports: [CommonModule, RouterLink, PeriodSwitch, EntryCard],
  template: `
    <header class="page-header">
      <h2>Diary</h2>
      <button class="share-btn" (click)="shareDiary()" type="button" aria-label="Share diary">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"/>
          <polyline points="16,6 12,2 8,6"/>
          <line x1="12" y1="2" x2="12" y2="15"/>
        </svg>
        <span>Share</span>
      </button>
    </header>
    <section class="content">
      <div class="content-header">
        <p>Entries for {{ (period ?? 'daily') }}</p>
        <app-period-switch />
      </div>
      <ng-container *ngIf="filteredEntries().length; else empty">
        <div class="list">
          <app-entry-card *ngFor="let e of filteredEntries()" [entry]="e" />
        </div>
      </ng-container>
      <ng-template #empty>
        <div class="content-header">
          <p>Entries for {{ (period ?? 'daily') }}</p>
          <app-period-switch />
        </div>
        <div class="empty">
          <p>No entries yet.</p>
          <a routerLink="/log">Add your first entry</a>
        </div>
      </ng-template>
    </section>
    <button class="fab" routerLink="/log" aria-label="Add new entry">
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M12 5v14M5 12h14"/>
      </svg>
    </button>

    <!-- Share Modal -->
    <div *ngIf="showShareModal" class="modal-overlay" (click)="closeShareModal()">
      <div class="modal" (click)="$event.stopPropagation()">
        <div class="modal-header">
          <h3>{{ shareSuccess ? 'Link Copied!' : 'Share Diary' }}</h3>
          <button type="button" class="close-button" (click)="closeShareModal()" aria-label="Close">
            <span>×</span>
          </button>
        </div>
        <div class="modal-body">
          <p *ngIf="!shareSuccess">
            Click below to copy your diary link to share with others.
          </p>
          <p *ngIf="shareSuccess">
            Your diary link has been copied to clipboard! You can now share it with others.
          </p>
          <div class="modal-actions">
            <button type="button" class="primary-button" (click)="copyShareLink()">
              {{ shareSuccess ? 'Copy Again' : 'Copy Link' }}
            </button>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: `
    .page-header {
      display:flex; align-items:center; justify-content: space-between;
      padding: var(--space-4); border-bottom:1px solid var(--border);
      background: var(--background);
    }
    h2 { font-size:20px; font-weight: 600; }
    .content { padding: var(--space-4); flex: 1; }
    .content-header {
      display: flex; align-items: center; justify-content: space-between;
      margin-bottom: var(--space-4);
    }
    .list { display:flex; flex-direction:column; gap:var(--space-3); }
    .empty {
      text-align:center; padding: var(--space-5) var(--space-4);
      color:var(--text-muted); margin-top: var(--space-5);
    }
    .empty p { font-size: 16px; margin-bottom: var(--space-3); }
    a { color:var(--primary); text-decoration:none; font-weight: 500; }
    .share-btn {
      background: var(--primary);
      color: white;
      border: none;
      padding: 8px 16px;
      border-radius: var(--radius);
      font-size: 14px;
      font-weight: 500;
      cursor: pointer;
      display: flex; align-items: center; gap: var(--space-2);
      transition: all 0.2s;
    }
    .share-btn:hover {
      background: color-mix(in srgb, var(--primary) 90%, black);
      transform: translateY(-1px);
    }
    .share-btn:active { transform: translateY(0); }

    /* Desktop styles */
    @media (min-width: 768px) {
      .page-header {
        padding: var(--space-5) var(--space-5);
      }
      h2 {
        font-size: 24px;
      }
      .content {
        padding: var(--space-5);
      }
      .content-header {
        margin-bottom: var(--space-5);
      }
      .empty {
        padding: var(--space-5);
        margin-top: var(--space-5);
      }
      .empty p {
        font-size: 18px;
      }
      .share-btn {
        font-size: 16px;
        padding: 10px 18px;
      }
    }

    .fab {
      position: fixed;
      bottom: 100px;
      right: var(--space-4);
      width: 56px;
      height: 56px;
      border-radius: 50%;
      background: var(--primary);
      color: white;
      border: none;
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 4px 12px rgba(11, 99, 243, 0.4);
      cursor: pointer;
      transition: all 0.2s;
      z-index: 999;
    }
    .fab:hover {
      transform: scale(1.05);
      box-shadow: 0 6px 16px rgba(11, 99, 243, 0.5);
    }
    .fab:active {
      transform: scale(0.95);
    }

    /* Desktop styles - adjust FAB position for consistent bottom nav */
    @media (min-width: 768px) {
      .fab {
        bottom: 100px; /* Keep above the fixed bottom nav */
        right: var(--space-5);
      }
    }

    /* Modal Styles - match log page design */
    .modal-overlay {
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0, 0, 0, 0.6);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 1000;
      backdrop-filter: blur(2px);
    }

    .modal {
      background: var(--background);
      border-radius: var(--radius);
      box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
      width: 90%;
      max-width: 400px;
      max-height: 90vh;
      overflow: hidden;
      animation: modalFadeIn 0.2s ease-out;
    }

    @keyframes modalFadeIn {
      from { opacity: 0; transform: scale(0.98) translateY(8px); }
      to { opacity: 1; transform: scale(1) translateY(0); }
    }

    .modal-header {
      padding: var(--space-4) var(--space-4) var(--space-3);
      border-bottom: 1px solid var(--border);
      display: flex;
      align-items: center;
      justify-content: space-between;
    }

    .modal-header h3 {
      margin: 0;
      font-size: 20px;
      font-weight: 600;
      color: var(--text);
    }

    .modal-body {
      padding: var(--space-4);
      text-align: center;
    }

    .modal-body p {
      margin: 0 0 var(--space-4) 0;
      color: var(--text);
      line-height: 1.5;
    }

    .modal-actions {
      display: flex;
      gap: var(--space-3);
      justify-content: center;
    }

    .modal-actions button {
      flex: 1;
      padding: var(--space-3) var(--space-4);
      border-radius: var(--radius);
      border: none;
      font-size: 16px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.2s;
      min-height: 48px;
    }

    .primary-button {
      background: var(--primary);
      color: #fff;
      border: 1px solid var(--primary);
    }

    .primary-button:hover {
      background: color-mix(in srgb, var(--primary) 90%, black);
      border-color: color-mix(in srgb, var(--primary) 90%, black);
      transform: translateY(-1px);
    }

    .close-button {
      width: 32px;
      height: 32px;
      border: none;
      background: transparent;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      color: var(--text-muted);
      transition: all 0.2s;
      font-size: 20px;
      line-height: 1;
    }

    .close-button:hover {
      background: color-mix(in srgb, var(--primary) 10%, transparent);
      color: var(--primary);
    }
  `
})
export class DiaryPage {
  protected period: string | null = null;
  protected showShareModal = false;
  protected shareUrl = '';
  protected shareSuccess = false;

  constructor(private route: ActivatedRoute, protected data: LocalDataService) {
    this.route.paramMap.subscribe(map => this.period = map.get('period'));
  }

  protected filteredEntries(): FoodEntry[] {
    const entries = this.data.entries();
    console.log('All entries:', entries); // Debug: see what entries we have

    const period = this.period ?? 'daily';

    // For MVP, daily shows all entries (most useful for users)
    if (period === 'daily') {
      return entries.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }

    const now = new Date();
    if (period === 'weekly') {
      const start = startOfWeek(now);
      const end = endOfWeek(now);
      return entries.filter(e => inRange(new Date(e.createdAt), start, end));
    }
    if (period === 'monthly') {
      const start = startOfMonth(now);
      const end = endOfMonth(now);
      return entries.filter(e => inRange(new Date(e.createdAt), start, end));
    }

    return entries;
  }

  protected shareDiary(): void {
    this.shareUrl = `${window.location.origin}/u/demo`;
    this.showShareModal = true;
  }

  protected async copyShareLink(): Promise<void> {
    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(this.shareUrl);
      } else {
        this.fallbackCopyTextToClipboard(this.shareUrl);
        return;
      }
      this.shareSuccess = true;
      // Auto-close modal after 2 seconds
      setTimeout(() => {
        this.closeShareModal();
      }, 2000);
    } catch (err) {
      console.error('Failed to copy: ', err);
      this.fallbackCopyTextToClipboard(this.shareUrl);
    }
  }

  protected closeShareModal(): void {
    this.showShareModal = false;
    this.shareSuccess = false;
  }

  private fallbackCopyTextToClipboard(text: string): void {
    const textArea = document.createElement('textarea');
    textArea.value = text;
    textArea.style.position = 'fixed';
    textArea.style.left = '-999999px';
    textArea.style.top = '-999999px';
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    try {
      document.execCommand('copy');
      this.shareSuccess = true;
      setTimeout(() => {
        this.closeShareModal();
      }, 2000);
    } catch (err) {
      console.error('Fallback: Oops, unable to copy', err);
      this.showShareModal = false;
      alert('Copy failed. Please manually copy this link: ' + text);
    }
    textArea.remove();
  }
}

function startOfDay(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate(), 0, 0, 0, 0);
}
function endOfDay(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate(), 23, 59, 59, 999);
}
function startOfWeek(d: Date): Date {
  const day = d.getDay();
  const diff = (day + 6) % 7; // Monday as start
  const start = new Date(d);
  start.setDate(d.getDate() - diff);
  return startOfDay(start);
}
function endOfWeek(d: Date): Date {
  const start = startOfWeek(d);
  const end = new Date(start);
  end.setDate(start.getDate() + 6);
  return endOfDay(end);
}
function startOfMonth(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth(), 1, 0, 0, 0, 0);
}
function endOfMonth(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth() + 1, 0, 23, 59, 59, 999);
}
function inRange(date: Date, start: Date, end: Date): boolean {
  return date >= start && date <= end;
}
