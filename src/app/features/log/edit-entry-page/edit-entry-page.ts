import { Component, ElementRef, ViewChild, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { LocalDataService } from '../../../core/local-data.service';
import { FoodEntry } from '../../../core/models';

@Component({
  selector: 'app-edit-entry-page',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <header class="page-header">
      <h2>Edit Entry</h2>
      <a href="#" (click)="onBack($event)" class="back-link">Back</a>
    </header>

    <section class="content" *ngIf="entry; else notFound">
      <!-- Hidden inputs for photo sources -->
      <input #fileInput type="file" accept="image/*" (change)="onFile($event)" hidden />
      <input #cameraInput type="file" accept="image/*;capture=camera" (change)="onCameraCapture($event)" hidden />

      <form (ngSubmit)="save()" class="form" (click)="$event.stopPropagation()">
        <!-- Photo section as first row -->
        <div class="photo-section">
          <div class="photo-preview" *ngIf="photoUrl; else addPhotoBlock">
            <img [src]="photoUrl" alt="Current photo" />
          </div>
          <ng-template #addPhotoBlock>
            <div class="photo-empty">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
                <rect x="3" y="3" width="18" height="14" rx="2"/>
                <path d="M8.5 13l2.5-3 2 2.5L15.5 9l3.5 4"/>
              </svg>
              <span>No photo</span>
            </div>
          </ng-template>
          <div class="photo-actions">
            <button type="button" class="btn-change" (click)="openPhotoModal()">Change photo</button>
            <button type="button" class="btn-remove" (click)="removePhoto()" [disabled]="!photoUrl">Remove photo</button>
          </div>
        </div>

        <label>
          <span>Name</span>
          <input type="text" [(ngModel)]="name" name="name" required />
        </label>

        <label>
          <span>Quantity</span>
          <div class="quantity-row">
            <input type="number" step="0.01" min="0" [(ngModel)]="quantityValue" name="quantityValue" />
            <select [(ngModel)]="quantityUnit" name="quantityUnit" class="dropdown-select">
              <option value="number">Number</option>
              <option value="grams">Grams</option>
              <option value="ounces">Ounces</option>
              <option value="cups">Cups</option>
              <option value="tablespoons">Tablespoons</option>
              <option value="pieces">Pieces</option>
            </select>
          </div>
        </label>

        <label>
          Meal type
          <select [(ngModel)]="mealType" name="mealType" class="dropdown-select">
            <option value="breakfast">Breakfast</option>
            <option value="lunch">Lunch</option>
            <option value="dinner">Dinner</option>
            <option value="snack">Snack</option>
          </select>
        </label>

        <label>
          Type
          <div class="segmented" role="group" aria-label="Type">
            <button type="button" class="segment" [attr.aria-pressed]="foodDrinkType==='food'" [class.active]="foodDrinkType==='food'" (click)="selectFoodDrinkType('food')">
              <span>Food</span>
              <span aria-hidden="true" class="icon">🍽️</span>
            </button>
            <button type="button" class="segment" [attr.aria-pressed]="foodDrinkType==='drink'" [class.active]="foodDrinkType==='drink'" (click)="selectFoodDrinkType('drink')">
              <span>Drink</span>
              <span aria-hidden="true" class="icon">🥤</span>
            </button>
          </div>
        </label>

        <label *ngIf="foodDrinkType === 'drink'">
          Temperature
          <div class="segmented" role="group" aria-label="Temperature">
            <button type="button" class="segment" [attr.aria-pressed]="temperature==='hot'" [class.active]="temperature==='hot'" (click)="selectTemperature('hot')">
              <span>Hot</span>
              <span aria-hidden="true" class="icon">☕</span>
            </button>
            <button type="button" class="segment" [attr.aria-pressed]="temperature==='iced'" [class.active]="temperature==='iced'" (click)="selectTemperature('iced')">
              <span>Iced</span>
              <span aria-hidden="true" class="icon">🥤</span>
            </button>
          </div>
        </label>

        <label>
          Notes
          <textarea [(ngModel)]="notes" name="notes" rows="3" placeholder="Optional"></textarea>
        </label>

        

        <div class="actions">
          <div class="actions-inner">
            <button type="button" class="reset-button" (click)="onCancel()">Cancel</button>
            <button type="submit">Save Changes</button>
          </div>
        </div>
      </form>
    </section>

    <!-- Photo Upload Modal (same as log page) -->
    <div *ngIf="showPhotoModal" class="photo-modal-overlay" (click)="closePhotoModal()">
      <div class="photo-modal" (click)="$event.stopPropagation()">
        <div class="photo-modal-header">
          <h3>Choose Photo Source</h3>
          <button type="button" class="close-button" (click)="closePhotoModal()" aria-label="Close">
            <span>×</span>
          </button>
        </div>
        <div class="photo-modal-body">
          <div class="photo-option" (click)="useCamera()" [class.clicked]="cameraOptionClicked">
            <div class="photo-option-icon">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h3l2-3h8l2 3h3a2 2 0 0 1 2 2z"/>
                <circle cx="12" cy="13" r="4"/>
              </svg>
            </div>
            <div class="photo-option-content">
              <h4>Use Camera</h4>
              <p>Take a new photo</p>
            </div>
          </div>
          <div class="photo-option" (click)="uploadFromGallery()">
            <div class="photo-option-icon">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <rect x="3" y="3" width="18" height="14" rx="2"/>
                <path d="M8.5 13l2.5-3 2 2.5L15.5 9l3.5 4"/>
              </svg>
            </div>
            <div class="photo-option-content">
              <h4>{{isMobile ? 'Choose from Gallery' : 'Upload from Computer'}}</h4>
              <p>{{isMobile ? 'Select a photo from your gallery' : 'Choose an image file from your computer'}}</p>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Leave Confirmation Modal -->
    <div *ngIf="showLeaveConfirm" class="modal-overlay" (click)="closeLeaveConfirm()">
      <div class="modal" (click)="$event.stopPropagation()">
        <div class="modal-header">
          <h3>Unsaved Changes</h3>
          <button type="button" class="close-button" (click)="closeLeaveConfirm()" aria-label="Close">
            <span>×</span>
          </button>
        </div>
        <div class="modal-body">
          <p>You have unsaved changes. Do you want to save them before leaving?</p>
          <div class="modal-actions">
            <button type="button" class="cancel-button" (click)="discardAndLeave()">Discard</button>
            <button type="button" class="confirm-button" (click)="saveAndLeave()">Save & Exit</button>
          </div>
        </div>
      </div>
    </div>

    <!-- Update Success Modal -->
    <div *ngIf="showUpdateSuccess" class="modal-overlay" (click)="closeSuccess()">
      <div class="modal success-modal" (click)="$event.stopPropagation()">
        <div class="modal-body">
          <div class="success-badge" aria-hidden="true">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3">
              <polyline points="20 6 10 17 4 12" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </div>
          <h3 class="success-title">Updated Successfully</h3>
          <p class="success-subtitle">Changes to {{ entry?.name }} have been saved.</p>
          <div class="modal-actions">
            <button type="button" class="primary-button" (click)="goBackToDiary()">OK</button>
          </div>
        </div>
      </div>
    </div>

    <ng-template #notFound>
      <section class="content">
        <p>Entry not found.</p>
        <a routerLink="/diary/daily">Go back</a>
      </section>
    </ng-template>
  `,
  styles: `
    .page-header {
      display:flex; align-items:center; justify-content: space-between;
      padding: var(--space-4); border-bottom:1px solid var(--border);
      background: var(--background);
      position: sticky; top: 0; z-index: 50;
    }
    h2 { font-size:20px; font-weight: 600; }
    .back-link { color: var(--primary); text-decoration: none; }
    .content { padding: var(--space-4); padding-bottom: calc(112px + env(safe-area-inset-bottom)); }
    .form { display:grid; gap: var(--space-4); max-width: 640px; }
    label { display:grid; gap: var(--space-2); }
    input, select, textarea {
      width: 100%; padding: var(--space-3); border: 1px solid var(--border); border-radius: var(--radius);
      font-size: 16px; background: var(--background); color: var(--text);
    }
    textarea {
      resize: vertical;
      min-height: 80px;
    }
    /* Custom dropdown styling to match log-page */
    select {
      -webkit-appearance: none; /* Safari */
      -moz-appearance: none;    /* Firefox */
      appearance: none;
      padding-right: 44px; /* room for chevron */
      background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%239aa0a6' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'/%3E%3C/svg%3E");
      background-repeat: no-repeat;
      background-position: right 12px center;
      background-size: 16px;
      cursor: pointer;
    }
    select:focus {
      outline: none;
      border-color: var(--primary);
      box-shadow: 0 0 0 3px color-mix(in srgb, var(--primary) 20%, transparent);
    }
    select.error {
      border-color: #ff4757;
      background-color: color-mix(in srgb, #ff4757 5%, transparent);
    }

    /* Error states */
    input.error, textarea.error, select.error {
      border-color: #ff4757;
      background-color: color-mix(in srgb, #ff4757 5%, transparent);
    }

    /* Segmented control styles to match log page */
    .segmented { display:flex; gap: var(--space-3); }
    .segment {
      flex: 1;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: var(--space-2);
      padding: 12px 16px;
      border: 1px solid var(--border);
      border-radius: var(--radius);
      background: var(--background);
      color: var(--text);
      cursor: pointer;
      transition: all 0.15s ease-in-out;
    }
    .segment .icon { font-size: 18px; }
    .segment.active {
      background: color-mix(in srgb, var(--primary) 12%, transparent);
      border-color: var(--primary);
      color: var(--primary);
      box-shadow: inset 0 0 0 1px var(--primary);
      font-weight: 600;
    }
    .segment:focus-visible { outline: 2px solid color-mix(in srgb, var(--primary) 35%, transparent); outline-offset: 2px; }
    /* Quantity input styling */
    .quantity-row {
      display: flex;
      gap: var(--space-2);
    }
    .quantity-row input {
      flex: 1;
    }
    .quantity-row select {
      flex: 0 0 120px;
    }

    /* Error message styling */
    .error-message {
      color: #ff4757;
      font-size: 14px;
      margin-top: 4px;
      display: block;
    }

    .photo-section { display:flex; align-items: flex-start; gap: var(--space-4); }
    .photo-preview img { width: 96px; height: 96px; object-fit: cover; border-radius: var(--radius); border:1px solid var(--border); }
    .photo-empty { width: 96px; height: 96px; border:1px dashed var(--border); border-radius: var(--radius); display:grid; place-items:center; color: var(--text-muted); gap: 6px; font-size: 12px; }
    .photo-actions { display:flex; flex-direction: column; gap: var(--space-2); align-items: flex-start; }
    .btn-change { background: var(--primary); color: #fff; border:none; padding: 8px 12px; border-radius: var(--radius); cursor: pointer; }
    .btn-change:hover { filter: brightness(0.95); }
    .btn-remove { background: transparent; color: #ef4444; border:1px solid #ef4444; padding: 8px 12px; border-radius: var(--radius); cursor: pointer; }
    .btn-remove:disabled { opacity: 0.5; cursor: not-allowed; }
    .btn-remove:hover:not(:disabled) { background: color-mix(in srgb, #ef4444 10%, transparent); }
    .actions {
      position: fixed; left: 0; right: 0; bottom: 0;
      background: var(--background);
      padding: var(--space-3) var(--space-4) calc(var(--space-3) + env(safe-area-inset-bottom));
      border-top: 1px solid var(--border);
      z-index: 60;
    }
    .actions-inner { display:flex; gap:var(--space-2); max-width: 640px; margin: 0 auto; }
    .actions-inner > button {
      width: 100%; padding:var(--space-3) var(--space-4); border-radius:var(--radius); border:0;
      font-size:16px; font-weight:600; cursor:pointer;
      min-height: 48px; transition: all 0.2s;
    }
    .actions-inner > button[type="submit"] { background:var(--primary); color:#fff; }
    .actions-inner > button[type="submit"]:hover { opacity:0.9; transform: translateY(-1px); }
    .actions-inner > button[type="submit"]:active { transform: translateY(0); }
    .actions-inner > button.reset-button {
      background: transparent;
      color: #ff4757;
      border: 1px solid #ff4757;
      border-radius: var(--radius);
      font-weight: 600;
    }
    .actions-inner > button.reset-button:hover { background: #ff4757; color: #fff; border-color: #ff4757; transform: translateY(-1px); }
    .actions-inner > button.reset-button:active { transform: translateY(0); }
    .actions-inner > button.reset-button:focus-visible { outline: 2px solid color-mix(in srgb, #ff4757 30%, transparent); outline-offset: 2px; }

    /* Generic Modal Styles (match log page reset/cancel) */
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

    .modal-header h3 { margin: 0; font-size: 20px; font-weight: 600; color: var(--text); }

    .modal-body { padding: var(--space-4); text-align: center; }

    .modal-actions { display: flex; gap: var(--space-3); justify-content: center; }

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

    .cancel-button { background: transparent; color: var(--text); border: 1px solid var(--border); }
    .cancel-button:hover { background: var(--border); }

    .confirm-button { background: #ff4757; color: #fff; border: 1px solid #ff4757; }
    .confirm-button:hover { background: #ff3742; border-color: #ff3742; transform: translateY(-1px); }

    /* Success Modal visuals (match log page) */
    .success-modal { text-align: center; }
    .success-badge {
      width: 64px; height: 64px; margin: 0 auto var(--space-4);
      border-radius: 999px; background: #e9f9ef; color: #22c55e;
      display: grid; place-items: center;
      box-shadow: 0 6px 20px rgba(34,197,94,0.25) inset;
    }
    .success-title { font-size: 24px; font-weight: 800; color: var(--text); margin: 0 0 var(--space-2); letter-spacing: -0.02em; }
    .success-subtitle { color: var(--text-muted); margin: 0 0 var(--space-6); font-size: 16px; }
    .primary-button {
      background: var(--primary);
      color: #fff;
      border: 1px solid var(--primary);
      padding: var(--space-3) var(--space-6);
      border-radius: var(--radius);
      font-size: 16px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.2s;
      min-height: 48px;
    }
    .primary-button:hover { background: color-mix(in srgb, var(--primary) 90%, black); border-color: color-mix(in srgb, var(--primary) 90%, black); transform: translateY(-1px); }
    .success-modal .modal-actions { margin-top: var(--space-4); }
    .success-modal .primary-button { min-width: 160px; border-radius: 999px; }

    /* Photo Modal Styles (mirrors log page) */
    .photo-modal-overlay {
      position: fixed; top: 0; left: 0; width: 100%; height: 100%;
      background: rgba(0, 0, 0, 0.6); display: flex; align-items: center; justify-content: center;
      z-index: 1000; backdrop-filter: blur(2px);
    }
    .photo-modal {
      background: var(--background); border-radius: var(--radius);
      box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
      width: 90%; max-width: 400px; max-height: 90vh; overflow: hidden;
      animation: modalFadeIn 0.2s ease-out;
    }
    @keyframes modalFadeIn { from { opacity: 0; } to { opacity: 1; } }
    .photo-modal-header { padding: var(--space-4) var(--space-4) var(--space-3); border-bottom: 1px solid var(--border); display: flex; align-items: center; justify-content: space-between; }
    .photo-modal-header h3 { margin: 0; font-size: 20px; font-weight: 600; color: var(--text); }
    .close-button { width: 32px; height: 32px; border: none; background: transparent; border-radius: 50%; display: flex; align-items: center; justify-content: center; cursor: pointer; color: var(--text-muted); transition: all 0.2s; font-size: 20px; line-height: 1; }
    .close-button:hover { background: color-mix(in srgb, var(--primary) 10%, transparent); color: var(--primary); }
    .photo-modal-body { padding: var(--space-4); display: flex; flex-direction: column; gap: var(--space-3); }
    .photo-option { display: flex; align-items: center; gap: var(--space-3); padding: var(--space-3); border: 1px solid var(--border); border-radius: var(--radius); cursor: pointer; transition: all 0.2s; }
    .photo-option:hover { background: var(--border); }
    .photo-option.clicked { transform: scale(0.98); opacity: 0.9; }
    .photo-option-icon { width: 40px; height: 40px; display: grid; place-items: center; color: var(--primary); background: color-mix(in srgb, var(--primary) 10%, transparent); border-radius: 8px; }
    .photo-option-content h4 { margin: 0; font-size: 16px; }
    .photo-option-content p { margin: 0; color: var(--text-muted); font-size: 13px; }

    /* Desktop styles */
    @media (min-width: 768px) {
      .page-header { padding: var(--space-5); }
      .content { padding: var(--space-5); padding-bottom: calc(120px + env(safe-area-inset-bottom)); }
      .form { margin: 0 auto; }
      .actions > button { font-size: 16px; min-height: 48px; }
      .actions > button.reset-button { font-size: 16px; min-height: 48px; background: transparent; border: 1px solid #ff4757; border-radius: var(--radius); font-weight: 600; }
      .actions > button.reset-button:hover { background: #ff4757; color: #fff; border-color: #ff4757; }
      .actions { padding-left: var(--space-5); padding-right: var(--space-5); }
      input, select, textarea {
        padding: var(--space-4);
        font-size: 16px;
      }
      select {
        padding-right: 52px; /* a bit more room for chevron on desktop */
        background-position: right 16px center;
      }
      .quantity-row select {
        flex: 0 0 140px;
      }
      textarea {
        min-height: 120px; /* Larger on desktop */
      }
    }
  `
})
export class EditEntryPage {
  @ViewChild('fileInput') fileInput!: ElementRef<HTMLInputElement>;
  @ViewChild('cameraInput') cameraInput!: ElementRef<HTMLInputElement>;
  protected entry?: FoodEntry;
  protected id = '';

  protected name = '';
  protected quantityValue: number | string = '';
  protected quantityUnit: 'number'|'grams'|'ounces'|'cups'|'tablespoons'|'pieces' = 'pieces';
  protected notes = '';
  protected photoUrl: string | undefined;
  protected mealType: 'breakfast'|'lunch'|'dinner'|'snack' = 'snack';
  protected foodDrinkType: 'food'|'drink' = 'food';
  protected temperature: 'hot'|'iced' | undefined = undefined;
  protected isMobile = false;
  protected showPhotoModal = false;
  protected cameraOptionClicked = false;
  protected showLeaveConfirm = false;
  protected showUpdateSuccess = false;
  private initialSnapshot = '';

  constructor(private route: ActivatedRoute, private router: Router, private data: LocalDataService) {
    const idParam = this.route.snapshot.paramMap.get('id');
    if (!idParam) {
      this.router.navigateByUrl('/diary/daily');
      return;
    }
    this.id = idParam;
    this.detectPlatform();
    const e = this.data.getById(this.id);
    if (!e) {
      this.router.navigateByUrl('/diary/daily');
      return;
    }
    this.entry = e;
    this.name = e.name;
    this.setQuantityFromString(e.quantity);
    this.notes = e.notes || '';
    this.photoUrl = e.photoUrl;
    this.mealType = e.mealType;
    this.foodDrinkType = e.foodDrinkType;
    this.temperature = e.temperature;
    // Capture initial state snapshot to detect changes
    this.initialSnapshot = this.serializeState();
  }

  private detectPlatform() {
    this.isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) || (window.innerWidth <= 768);
  }

  private setQuantityFromString(q?: string) {
    if (!q) {
      this.quantityValue = '';
      this.quantityUnit = 'pieces';
      return;
    }
    const parts = q.trim().split(/\s+/);
    const num = parseFloat(parts[0] || '');
    if (!isNaN(num)) {
      this.quantityValue = num;
      const unit = (parts.slice(1).join(' ') || 'pieces') as typeof this.quantityUnit;
      this.quantityUnit = (['number','grams','ounces','cups','tablespoons','pieces'].includes(unit) ? unit : 'pieces') as any;
    } else {
      this.quantityValue = parts.join(' ');
      this.quantityUnit = 'pieces';
    }
  }

  removePhoto() {
    this.photoUrl = undefined;
  }

  openPhotoModal() {
    this.showPhotoModal = true;
  }

  closePhotoModal() {
    this.showPhotoModal = false;
  }

  useCamera() {
    this.cameraOptionClicked = true;
    setTimeout(() => (this.cameraOptionClicked = false), 300);
    this.closePhotoModal();
    setTimeout(() => {
      if (this.cameraInput && this.cameraInput.nativeElement) {
        this.cameraInput.nativeElement.click();
      } else if (this.fileInput) {
        this.fileInput.nativeElement.click();
      }
    }, 150);
  }

  uploadFromGallery() {
    this.closePhotoModal();
    if (this.fileInput) {
      this.fileInput.nativeElement.click();
    }
  }

  onFile(event: Event) {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      this.photoUrl = reader.result as string;
      this.closePhotoModal();
    };
    reader.readAsDataURL(file);
  }

  onCameraCapture(event: Event) {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      this.photoUrl = reader.result as string;
      this.closePhotoModal();
    };
    reader.readAsDataURL(file);
  }

  // Match log-page segmented control handlers
  selectFoodDrinkType(value: 'food'|'drink') {
    this.foodDrinkType = value;
    // Clear temperature when not a drink
    if (value !== 'drink') {
      this.temperature = undefined;
    }
  }

  selectTemperature(value: 'hot'|'iced') {
    this.temperature = value;
  }

  save() {
    if (!this.id) return;
    const quantityStr = this.quantityValue !== '' && this.quantityValue != null
      ? `${this.quantityValue} ${this.quantityUnit}`
      : undefined;
    const changes: Partial<FoodEntry> = {
      name: (this.name || '').trim(),
      quantity: quantityStr,
      notes: (this.notes || '').trim() || undefined,
      photoUrl: this.photoUrl,
      mealType: this.mealType,
      foodDrinkType: this.foodDrinkType,
      temperature: this.foodDrinkType === 'drink' ? this.temperature : undefined
    };

    const updated = this.data.update(this.id, changes);
    if (updated) {
      this.initialSnapshot = this.serializeState();
      this.showUpdateSuccess = true;
    }
  }

  private serializeState(): string {
    return JSON.stringify({
      name: (this.name || '').trim(),
      quantityValue: this.quantityValue,
      quantityUnit: this.quantityUnit,
      notes: (this.notes || '').trim() || undefined,
      photoUrl: this.photoUrl,
      mealType: this.mealType,
      foodDrinkType: this.foodDrinkType,
      temperature: this.temperature
    });
  }

  private hasUnsavedChanges(): boolean {
    return this.serializeState() !== this.initialSnapshot;
    }

  onBack(event: Event) {
    event.preventDefault();
    if (this.hasUnsavedChanges()) {
      this.showLeaveConfirm = true;
    } else {
      this.router.navigateByUrl('/diary/daily');
    }
  }

  onCancel() {
    if (this.hasUnsavedChanges()) {
      this.showLeaveConfirm = true;
    } else {
      this.router.navigateByUrl('/diary/daily');
    }
  }

  closeLeaveConfirm() { this.showLeaveConfirm = false; }
  saveAndLeave() { this.save(); this.showLeaveConfirm = false; }
  discardAndLeave() { this.showLeaveConfirm = false; this.router.navigateByUrl('/diary/daily'); }

  closeSuccess() { this.showUpdateSuccess = false; }
  goBackToDiary() { this.showUpdateSuccess = false; this.router.navigateByUrl('/diary/daily'); }

  @HostListener('window:beforeunload', ['$event'])
  handleBeforeUnload(event: BeforeUnloadEvent) {
    if (this.hasUnsavedChanges()) {
      event.preventDefault();
      event.returnValue = '';
    }
  }
}


