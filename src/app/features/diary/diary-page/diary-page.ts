import { Component } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { PeriodSwitch } from '../../../shared/period-switch/period-switch';
import { LocalDataService } from '../../../core/local-data.service';
import { SharedDiaryService } from '../../../core/shared-diary.service';
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
          <h3>{{ shareSuccess ? 'Share Link Copied!' : 'Share Your Diary' }}</h3>
          <button type="button" class="close-button" (click)="closeShareModal()" aria-label="Close">
            <span>×</span>
          </button>
        </div>
        <div class="modal-body">
          <p *ngIf="!shareSuccess">
            Share your diary with nutritionists, trainers, or healthcare providers.
            They'll be able to view all your entries from the past 30 days.
          </p>
          <div *ngIf="!shareSuccess" class="share-preview">
            <div class="preview-content">
              <h4>Your Diary Summary</h4>
              <div class="preview-stats">
                <div class="stat">
                  <span class="stat-number">{{ data.entries().length }}</span>
                  <span class="stat-label">Total Entries</span>
                </div>
                <div class="stat">
                  <span class="stat-number">{{ foodItemsCount() }}</span>
                  <span class="stat-label">Food Items</span>
                </div>
                <div class="stat">
                  <span class="stat-number">{{ drinkItemsCount() }}</span>
                  <span class="stat-label">Drink Items</span>
                </div>
              </div>
            </div>
          </div>
          <p *ngIf="shareSuccess">
            Your shareable diary link has been copied to clipboard! Anyone with this link can view your diary entries for 30 days.
          </p>
          <div class="modal-actions">
            <button type="button" class="primary-button" (click)="shareDiary()">
              {{ shareSuccess ? 'Copy Link Again' : 'Generate Share Link' }}
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

    /* Share Modal Styles */
    .modal-overlay {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0, 0, 0, 0.5);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 1000;
      padding: var(--space-4);
    }
    .modal {
      background: var(--background);
      border-radius: var(--radius-lg);
      box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
      max-width: 500px;
      width: 100%;
      max-height: 80vh;
      overflow: hidden;
    }
    .modal-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: var(--space-4);
      border-bottom: 1px solid var(--border);
      background: var(--card);
    }
    .modal-header h3 {
      margin: 0;
      font-size: 18px;
      font-weight: 600;
      color: var(--text);
    }
    .close-button {
      background: none;
      border: none;
      font-size: 24px;
      color: var(--text-muted);
      cursor: pointer;
      padding: 0;
      width: 32px;
      height: 32px;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: var(--radius);
      transition: background-color 0.2s;
    }
    .close-button:hover {
      background: var(--muted);
      color: var(--text);
    }
    .modal-body {
      padding: var(--space-4);
      max-height: 60vh;
      overflow-y: auto;
    }
    .modal-body p {
      margin: 0 0 var(--space-3) 0;
      color: var(--text-muted);
    }
    .share-preview {
      background: var(--muted);
      border-radius: var(--radius);
      padding: var(--space-4);
      margin-bottom: var(--space-3);
    }
    .preview-content h4 {
      margin: 0 0 var(--space-3) 0;
      color: var(--text);
      font-size: 16px;
      font-weight: 600;
    }
    .preview-stats {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(100px, 1fr));
      gap: var(--space-3);
    }
    .stat {
      text-align: center;
      background: var(--background);
      border-radius: var(--radius);
      padding: var(--space-2);
      border: 1px solid var(--border);
    }
    .stat-number {
      display: block;
      font-size: 20px;
      font-weight: 700;
      color: var(--primary);
    }
    .stat-label {
      display: block;
      font-size: 12px;
      color: var(--text-muted);
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    .modal-actions {
      margin-top: var(--space-4);
      display: flex;
      justify-content: center;
    }
    .primary-button {
      background: var(--primary);
      color: white;
      border: none;
      padding: 12px 24px;
      border-radius: var(--radius);
      font-size: 16px;
      font-weight: 500;
      cursor: pointer;
      transition: background-color 0.2s;
    }
    .primary-button:hover {
      background: color-mix(in srgb, var(--primary) 90%, black);
    }

    /* Desktop Modal Styles */
    @media (min-width: 768px) {
      .modal-overlay {
        padding: var(--space-5);
      }
      .modal-header {
        padding: var(--space-5);
      }
      .modal-header h3 {
        font-size: 20px;
      }
      .modal-body {
        padding: var(--space-5);
      }
      .preview-stats {
        grid-template-columns: repeat(3, 1fr);
      }
      .stat-number {
        font-size: 24px;
      }
    }
  `
})
export class DiaryPage {
  protected period: string | null = null;
  protected showShareModal = false;
  protected shareSuccess = false;

  constructor(
    private route: ActivatedRoute,
    protected data: LocalDataService,
    private sharedDiaryService: SharedDiaryService
  ) {
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

  // Safe computed counts for template bindings
  protected foodItemsCount(): number {
    try {
      return this.data.entries().filter(e => e.foodDrinkType === 'food').length;
    } catch {
      return 0;
    }
  }

  protected drinkItemsCount(): number {
    try {
      return this.data.entries().filter(e => e.foodDrinkType === 'drink').length;
    } catch {
      return 0;
    }
  }

  protected shareDiary(): void {
    const entries = this.data.entries();

    if (entries.length === 0) {
      alert('No entries to share. Add some entries first!');
      return;
    }

    const shareId = this.sharedDiaryService.createSharedDiary(entries);
    const shareUrl = `${window.location.origin}/shared/${shareId}`;

    this.copyTextToClipboard(shareUrl);
  }

  protected closeShareModal(): void {
    this.showShareModal = false;
    this.shareSuccess = false;
  }

  private async copyTextToClipboard(text: string): Promise<void> {
    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(text);
      } else {
        this.fallbackCopyTextToClipboard(text);
        return;
      }

      // Show success feedback
      this.showSuccessMessage('Share link copied to clipboard!');
    } catch (err) {
      console.error('Failed to copy: ', err);
      this.fallbackCopyTextToClipboard(text);
    }
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
      this.showSuccessMessage('Share link copied to clipboard!');
    } catch (err) {
      console.error('Fallback: Oops, unable to copy', err);
      alert('Copy failed. Please manually copy this link:\n\n' + text);
    }
    textArea.remove();
  }

  private showSuccessMessage(message: string): void {
    // For simplicity, show an alert. In a real app, you might use a toast notification
    alert(message + '\n\nYou can now share this link with others!');
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
