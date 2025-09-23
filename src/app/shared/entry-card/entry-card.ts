import { Component, Input, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FoodEntry } from '../../core/models';
import { LocalDataService } from '../../core/local-data.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-entry-card',
  imports: [CommonModule],
  template: `
    <article class="card" (click)="goToDetails()">
      <div class="meta">
        <div class="header-row">
          <strong>{{ entry?.name }}</strong>
        </div>
        <div class="info-row">
          <small>{{ entry?.createdAt | date:'short' }}</small>
          <span [ngClass]="getMealChipClass()">{{ entry?.mealType }}</span>
        </div>
        <div class="extra" *ngIf="entry?.quantity || entry?.notes">
          <small *ngIf="entry?.quantity">Qty: {{ entry?.quantity }}</small>
          <p *ngIf="entry?.notes">{{ entry?.notes }}</p>
        </div>
      </div>
      <div class="thumb" *ngIf="entry?.photoUrl">
        <img [src]="entry?.photoUrl" alt="Photo of {{ entry?.name }}" loading="lazy" />
      </div>
      <div class="kebab-container">
        <button
          class="kebab-btn"
          (click)="toggleMenu($event)"
          type="button"
          aria-label="More options"
          title="More options">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
            <circle cx="12" cy="5" r="2"/>
            <circle cx="12" cy="12" r="2"/>
            <circle cx="12" cy="19" r="2"/>
          </svg>
        </button>
        <div class="kebab-menu" *ngIf="showMenu" (click)="$event.stopPropagation()">
          <button type="button" class="menu-item" (click)="onEdit()">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
              <path d="M12 20h9"/>
              <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4 12.5-12.5z"/>
            </svg>
            <span>Edit</span>
          </button>
          <button type="button" class="menu-item danger" (click)="onDeleteClick()">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
              <polyline points="3 6 5 6 21 6"/>
              <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
              <path d="M10 11v6"/>
              <path d="M14 11v6"/>
              <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/>
            </svg>
            <span>Delete</span>
          </button>
        </div>
      </div>
    </article>

    <!-- Confirmation Modal (matches reset modal style) -->
    <div *ngIf="showConfirmModal" class="modal-overlay" (click)="hideConfirmModal()">
      <div class="modal" (click)="$event.stopPropagation()">
        <div class="modal-header">
          <h3>Confirm Remove</h3>
          <button type="button" class="close-button" (click)="hideConfirmModal()" aria-label="Close">
            <span>×</span>
          </button>
        </div>
        <div class="modal-body">
          <p>Are you sure you want to remove <strong>"{{ entry?.name }}"</strong>? This action cannot be undone.</p>
          <div class="modal-actions">
            <button type="button" class="cancel-button" (click)="hideConfirmModal()">Cancel</button>
            <button type="button" class="confirm-button" (click)="confirmRemove()">Remove</button>
          </div>
        </div>
      </div>
    </div>

    <!-- Success Modal -->
    <div class="modal-overlay" *ngIf="showSuccessModal" (click)="hideSuccessModal()">
      <div class="modal success-modal" (click)="$event.stopPropagation()">
        <div class="success-icon">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
            <polyline points="22,4 12,14.01 9,11.01"/>
          </svg>
        </div>
        <h3>Entry Removed</h3>
        <p>"{{ entry?.name }}" has been successfully removed from your diary.</p>
        <button class="btn-primary" (click)="hideSuccessModal()">OK</button>
      </div>
    </div>
  `,
  styles: `
    .card {
      display:flex; gap:var(--space-3); padding: var(--space-4) 0;
      border-bottom:1px solid var(--border); align-items: flex-start;
    }
    .thumb {
      flex-shrink: 0; order: 2;
    }
    .thumb img {
      width:64px; height:64px; object-fit:cover; border-radius:var(--radius);
      border: 1px solid var(--border);
    }
    .meta {
      display:flex; flex-direction:column; gap:var(--space-2);
      flex: 1; min-width: 0; order: 1;
    }
    .header-row {
      display: flex; align-items: flex-start; justify-content: space-between; gap: var(--space-2);
    }
    .header-row strong {
      font-size:16px; color:var(--text); font-weight:600;
      word-break: break-word; margin: 0; flex: 1;
    }
    .kebab-container { order: 3; position: relative; margin-left: auto; }
    .kebab-btn {
      background: transparent;
      border: 1px solid var(--border);
      color: var(--text-muted);
      cursor: pointer;
      padding: var(--space-1);
      border-radius: 999px;
      display: flex; align-items: center; justify-content: center;
      transition: all 0.2s;
      flex-shrink: 0;
    }
    .kebab-btn:hover { background: var(--border); color: var(--text); }
    .kebab-btn:active { transform: scale(0.98); }

    .kebab-menu {
      position: absolute;
      right: 0;
      top: calc(100% + 4px);
      background: var(--background);
      border: 1px solid var(--border);
      border-radius: var(--radius);
      box-shadow: 0 12px 28px rgba(0,0,0,0.12);
      padding: 4px;
      min-width: 160px;
      z-index: 10;
    }
    .menu-item {
      width: 100%;
      display: flex; align-items: center; gap: var(--space-2);
      padding: 8px 10px;
      background: transparent;
      border: none;
      color: var(--text);
      cursor: pointer;
      border-radius: var(--radius);
      transition: background 0.15s ease;
      text-align: left;
    }
    .menu-item:hover { background: var(--border); }
    .menu-item svg { color: var(--text-muted); }
    .menu-item.danger { color: #ef4444; }
    .menu-item.danger svg { color: #ef4444; }
    .info-row {
      display: flex; align-items: center; gap: var(--space-2); flex-wrap: wrap;
    }
    .info-row small {
      color:var(--text-muted); font-size:13px;
    }
    .meal-chip {
      padding: var(--space-1) var(--space-2);
      border-radius: var(--radius);
      font-size: 11px;
      font-weight: 500;
      text-transform: capitalize;
      white-space: nowrap;
    }

    /* Meal type specific colors */
    .breakfast-chip {
      background: rgba(255, 193, 7, 0.15);
      color: #f59e0b;
    }

    .lunch-chip {
      background: rgba(34, 197, 94, 0.15);
      color: #22c55e;
    }

    .dinner-chip {
      background: rgba(99, 102, 241, 0.15);
      color: #6366f1;
    }

    .snack-chip {
      background: rgba(251, 146, 60, 0.15);
      color: #fb923c;
    }
    .extra {
      color:var(--text-muted); font-size:12px;
      margin-top: var(--space-1);
      padding-top: var(--space-1);
    }
    .extra small { font-size:12px; }
    p {
      margin: var(--space-1) 0 0 0; font-size:14px; color: var(--text-muted);
      word-break: break-word; line-height: 1.4;
    }

    /* Mobile styles for smaller screens */
    @media (max-width: 480px) {
      .card {
        padding: var(--space-3) 0;
        gap: var(--space-2);
      }
      .thumb img {
        width: 48px;
        height: 48px;
      }
      .meta {
        gap: var(--space-1);
      }
      .info-row {
        gap: var(--space-1);
      }
      .meal-chip {
        font-size: 10px;
        padding: 2px var(--space-1);
      }
      .breakfast-chip {
        background: rgba(255, 193, 7, 0.2);
        color: #f59e0b;
      }
      .lunch-chip {
        background: rgba(34, 197, 94, 0.2);
        color: #22c55e;
      }
      .dinner-chip {
        background: rgba(99, 102, 241, 0.2);
        color: #6366f1;
      }
      .snack-chip {
        background: rgba(251, 146, 60, 0.2);
        color: #fb923c;
      }
      .extra {
        margin-top: 0;
        padding-top: 0;
      }

      .modal {
        padding: var(--space-5);
        max-width: 360px;
      }

      .modal h3 {
        font-size: 16px;
      }

      .modal p {
        font-size: 13px;
      }

      .btn-primary, .btn-secondary, .btn-danger {
        padding: var(--space-2) var(--space-3);
        font-size: 13px;
      }
    }

    /* Desktop styles */
    @media (min-width: 768px) {
      .card {
        padding: var(--space-5) 0;
      }
      .thumb img {
        width: 80px;
        height: 80px;
      }
      .meta {
        gap: var(--space-3);
      }
      .meta strong {
        font-size: 18px;
      }
      .info-row small {
        font-size: 14px;
      }
      .meal-chip {
        font-size: 12px;
        padding: var(--space-1) var(--space-2);
      }
      .breakfast-chip {
        background: rgba(255, 193, 7, 0.12);
        color: #f59e0b;
      }
      .lunch-chip {
        background: rgba(34, 197, 94, 0.12);
        color: #22c55e;
      }
      .dinner-chip {
        background: rgba(99, 102, 241, 0.12);
        color: #6366f1;
      }
      .snack-chip {
        background: rgba(251, 146, 60, 0.12);
        color: #fb923c;
      }
      .extra {
        font-size: 14px;
        margin-top: var(--space-2);
        padding-top: var(--space-2);
      }
      .extra small {
        font-size: 13px;
      }
      p {
        font-size: 15px;
      }

      .modal {
        padding: var(--space-6);
        max-width: 420px;
      }

      .modal h3 {
        font-size: 20px;
      }

      .modal p {
        font-size: 15px;
      }

      .btn-primary, .btn-secondary, .btn-danger {
        padding: var(--space-3) var(--space-5);
        font-size: 14px;
      }

      .success-icon {
        width: 56px;
        height: 56px;
      }
    }

    /* Modal Styles (matched to LogPage) */
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

    .cancel-button {
      background: transparent;
      color: var(--text-muted);
      border: 1px solid var(--border);
    }

    .cancel-button:hover { background: var(--border); color: var(--text); }

    .confirm-button {
      background: #ff4757;
      color: white;
      border: 1px solid #ff4757;
    }

    .confirm-button:hover {
      background: #ff3742;
      border-color: #ff3742;
      transform: translateY(-1px);
    }
  `
})
export class EntryCard {
  @Input() entry?: FoodEntry;

  // Modal states
  showConfirmModal = false;
  showSuccessModal = false;
  showMenu = false;

  constructor(private dataService: LocalDataService, private router: Router) {}

  getMealChipClass(): string {
    if (!this.entry?.mealType) return '';

    const baseClass = 'meal-chip';
    switch (this.entry.mealType) {
      case 'breakfast':
        return `${baseClass} breakfast-chip`;
      case 'lunch':
        return `${baseClass} lunch-chip`;
      case 'dinner':
        return `${baseClass} dinner-chip`;
      case 'snack':
        return `${baseClass} snack-chip`;
      default:
        return baseClass;
    }
  }

  showRemoveConfirmation(): void {
    this.showConfirmModal = true;
  }

  hideConfirmModal(): void {
    this.showConfirmModal = false;
  }

  confirmRemove(): void {
    if (!this.entry?.id) return;

    const success = this.dataService.remove(this.entry.id);
    if (success) {
      this.showConfirmModal = false;
      this.showSuccessModal = true;

      // Auto-hide success modal after 2 seconds
      setTimeout(() => {
        this.showSuccessModal = false;
      }, 2000);
    }
  }

  hideSuccessModal(): void {
    this.showSuccessModal = false;
  }

  @HostListener('document:keydown.escape')
  onEscapeKey(): void {
    if (this.showConfirmModal) {
      this.hideConfirmModal();
    } else if (this.showSuccessModal) {
      this.hideSuccessModal();
    } else if (this.showMenu) {
      this.closeMenu();
    }
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    if (!this.showMenu) return;
    const target = event.target as HTMLElement | null;
    if (!target) {
      this.closeMenu();
      return;
    }
    const insideKebab = target.closest('.kebab-container');
    if (!insideKebab) {
      this.closeMenu();
    }
  }

  toggleMenu(event: MouseEvent): void {
    event.stopPropagation();
    this.showMenu = !this.showMenu;
  }

  closeMenu(): void {
    if (this.showMenu) this.showMenu = false;
  }

  goToDetails(): void {
    this.closeMenu();
    if (!this.entry?.id) return;
    this.router.navigate(['/entry', this.entry.id]);
  }

  onDeleteClick(): void {
    this.closeMenu();
    this.showRemoveConfirmation();
  }

  onEdit(): void {
    this.closeMenu();
    if (!this.entry?.id) return;
    this.router.navigate(['/edit', this.entry.id]);
  }
}
