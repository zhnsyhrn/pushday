import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { LocalDataService } from '../../../core/local-data.service';
import { FoodEntry } from '../../../core/models';

@Component({
  selector: 'app-entry-detail-page',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <section class="detail">
      <header class="page-header">
        <a routerLink="/diary/daily" class="back-link" aria-label="Back">Back</a>
        <h2>Entry Details</h2>
        <div class="spacer"></div>
      </header>

      <ng-container *ngIf="entry; else notFound">
        <div class="card">
          <div class="photo" *ngIf="entry?.photoUrl" (click)="openImage()">
            <img [src]="entry?.photoUrl" alt="Photo of {{ entry?.name }}" />
            <small class="tap-hint">Tap to preview</small>
          </div>

          <div class="meta">
            <h3>{{ entry?.name }}</h3>
            <p class="sub">{{ entry?.createdAt | date:'fullDate' }} • {{ entry?.createdAt | date:'shortTime' }}</p>

            <div class="grid">
              <div>
                <label>Meal type</label>
                <div class="pill">{{ entry?.mealType }}</div>
              </div>
              <div>
                <label>Type</label>
                <div class="pill">{{ entry?.foodDrinkType }}</div>
              </div>
              <div *ngIf="entry?.foodDrinkType==='drink' && entry?.temperature">
                <label>Temperature</label>
                <div class="pill">{{ entry?.temperature }}</div>
              </div>
              <div *ngIf="entry?.quantity">
                <label>Quantity</label>
                <div class="pill">{{ entry?.quantity }}</div>
              </div>
            </div>

            <div *ngIf="entry?.notes" class="notes">
              <label>Notes</label>
              <p>{{ entry?.notes }}</p>
            </div>
          </div>

          <div class="actions">
            <button type="button" class="reset-button" (click)="confirmDelete()">Delete</button>
            <a class="primary-button" [routerLink]="['/edit', entry?.id]">Edit</a>
          </div>
        </div>
      </ng-container>

      <ng-template #notFound>
        <p>Entry not found.</p>
        <a routerLink="/diary/daily">Back to Diary</a>
      </ng-template>

      <!-- Image Preview Modal -->
      <div *ngIf="showImage" class="img-overlay" (click)="closeImage()">
        <img [src]="entry?.photoUrl" alt="Preview image" />
      </div>

      <!-- Delete Confirmation Modal -->
      <div *ngIf="showConfirm" class="modal-overlay" (click)="closeConfirm()">
        <div class="modal" (click)="$event.stopPropagation()">
          <div class="modal-header">
            <h3>Delete Entry</h3>
            <button type="button" class="close-button" (click)="closeConfirm()" aria-label="Close">
              <span>×</span>
            </button>
          </div>
          <div class="modal-body">
            <p>Delete "{{ entry?.name }}"? This cannot be undone.</p>
            <div class="modal-actions">
              <button type="button" class="cancel-button" (click)="closeConfirm()">Cancel</button>
              <button type="button" class="confirm-button" (click)="deleteEntry()">Delete</button>
            </div>
          </div>
        </div>
      </div>
    </section>
  `,
  styles: `
    .detail { padding: var(--space-4); }
    .page-header { display:grid; grid-template-columns: 1fr auto 1fr; align-items:center; margin-bottom: var(--space-4); }
    .page-header h2 { grid-column:2; margin:0; }
    .back-link { color: var(--primary); text-decoration: none; font-weight:500; }
    .spacer { height: 1px; }
    .card { display:grid; gap: var(--space-4); }
    .photo { position: relative; max-width: 420px; }
    .photo img { width: 100%; border-radius: var(--radius); border:1px solid var(--border); cursor: zoom-in; }
    .tap-hint { position:absolute; bottom:8px; right:12px; background: rgba(0,0,0,0.55); color:#fff; padding:2px 6px; border-radius: 999px; font-size: 12px; }
    .meta h3 { margin:0; font-weight:700; font-size:20px; }
    .sub { color: var(--text-muted); margin: 4px 0 0; }
    .grid { display:grid; grid-template-columns: repeat(auto-fit,minmax(160px,1fr)); gap: var(--space-3); margin-top: var(--space-4); }
    label { display:block; font-size: 12px; color: var(--text-muted); margin-bottom: 4px; }
    .pill { display:inline-block; border:1px solid var(--border); background: var(--background); padding:6px 10px; border-radius: var(--radius); }
    .notes { margin-top: var(--space-4); }
    .notes p { margin: 6px 0 0; }
    .actions { display:flex; gap: var(--space-2); margin-top: var(--space-4); }
    .actions > .primary-button,
    .actions > .reset-button { flex: 1; min-height: 48px; }
    .primary-button {
      background: var(--primary);
      color: white;
      border: 1px solid var(--primary);
      padding: var(--space-3) var(--space-6);
      border-radius: var(--radius);
      font-size: 16px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.2s;
      text-decoration: none;
      display: inline-grid; place-items: center;
    }
    .primary-button:hover {
      background: color-mix(in srgb, var(--primary) 90%, black);
      border-color: color-mix(in srgb, var(--primary) 90%, black);
      transform: translateY(-1px);
    }
    .reset-button {
      background: transparent;
      color: #ff4757;
      border: 1px solid #ff4757;
      border-radius: var(--radius);
      font-weight: 600;
      padding: var(--space-3) var(--space-6);
      cursor: pointer;
      transition: all 0.2s;
    }
    .reset-button:hover {
      background: #ff4757;
      color: #fff;
      border-color: #ff4757;
      transform: translateY(-1px);
    }
    .img-overlay { position: fixed; inset:0; background: rgba(0,0,0,0.8); display:grid; place-items:center; z-index:1000; }
    .img-overlay img { max-width: 92vw; max-height: 92vh; border-radius: 12px; }

    /* Modal styles shared */
    .modal-overlay { position: fixed; inset:0; background: rgba(0,0,0,0.6); display:flex; align-items:center; justify-content:center; z-index:1000; }
    .modal { background: var(--background); border-radius: var(--radius); width: 90%; max-width: 400px; overflow:hidden; box-shadow: 0 20px 40px rgba(0,0,0,0.3); }
    .modal-header { display:flex; align-items:center; justify-content:space-between; padding: var(--space-4); border-bottom:1px solid var(--border); }
    .modal-body { padding: var(--space-4); text-align:center; }
    .modal-actions { display:flex; gap: var(--space-3); justify-content:center; }
    .cancel-button { background: transparent; color: var(--text-muted); border:1px solid var(--border); padding: var(--space-3) var(--space-4); border-radius: var(--radius); cursor:pointer; }
    .confirm-button { background:#ff4757; color:#fff; border:1px solid #ff4757; padding: var(--space-3) var(--space-4); border-radius: var(--radius); cursor:pointer; }
  `
})
export class EntryDetailPage {
  entry?: FoodEntry;
  showImage = false;
  showConfirm = false;

  constructor(private route: ActivatedRoute, private router: Router, private data: LocalDataService) {
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) {
      this.router.navigateByUrl('/diary/daily');
      return;
    }
    this.entry = this.data.getById(id);
    if (!this.entry) {
      this.router.navigateByUrl('/diary/daily');
      return;
    }
  }

  openImage() { this.showImage = true; }
  closeImage() { this.showImage = false; }

  confirmDelete() { this.showConfirm = true; }
  closeConfirm() { this.showConfirm = false; }
  deleteEntry() {
    if (!this.entry?.id) return;
    const ok = this.data.remove(this.entry.id);
    if (ok) {
      this.showConfirm = false;
      this.router.navigateByUrl('/diary/daily');
    }
  }
}


