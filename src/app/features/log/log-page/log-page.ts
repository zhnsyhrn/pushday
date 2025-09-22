import { Component, ViewChild, ElementRef } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { LocalDataService } from '../../../core/local-data.service';
import { FoodEntry } from '../../../core/models';

@Component({
  selector: 'app-log-page',
  imports: [FormsModule, CommonModule],
  template: `
    <section class="log-form">
      <h2>Quick Add</h2>
      <form (ngSubmit)="save()">
        <div class="photo-upload" (click)="openPhotoModal()">
          <!-- Hidden file inputs for camera and gallery -->
          <input
            #fileInput
            id="fileInput"
            type="file"
            accept="image/*"
            (change)="onFile($event)"
            style="display: none;"
          />
          <input
            #cameraInput
            id="cameraInput"
            type="file"
            accept="image/*"
            [attr.capture]="isMobile ? 'environment' : 'user'"
            (change)="onCameraCapture($event)"
            style="display: none;"
          />
          <div class="photo-box">
            <div *ngIf="!photoDataUrl; else photoPreview" class="photo-placeholder">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1">
                <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
                <circle cx="9" cy="9" r="2"/>
                <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/>
              </svg>
              <span>Snap Foods/Drinks</span>
            </div>
            <ng-template #photoPreview>
              <img [src]="photoDataUrl" alt="Selected food" class="photo-preview" />
              <button type="button" class="remove-photo" (click)="removePhoto($event)" aria-label="Remove photo">
                <span>×</span>
              </button>
            </ng-template>
          </div>
        </div>

        <label>
          Meal type <span class="required">*</span>
          <select name="mealType" [(ngModel)]="mealType" (ngModelChange)="onMealTypeChange()" [class.error]="showErrors && !mealType">
            <option value="breakfast">Breakfast</option>
            <option value="lunch">Lunch</option>
            <option value="dinner">Dinner</option>
            <option value="snack">Snack</option>
          </select>
        </label>

        <div *ngIf="showErrors && !mealType" class="error-message">
          Please select a meal type
        </div>

         <label>
           Type <span class="required">*</span>
          <div class="segmented" role="group" aria-label="Type">
            <button type="button" class="segment" [class.active]="foodDrinkType==='food'" (click)="selectFoodDrinkType('food')">
              <span>Food</span>
              <span aria-hidden="true" class="icon">🍽️</span>
            </button>
            <button type="button" class="segment" [class.active]="foodDrinkType==='drink'" (click)="selectFoodDrinkType('drink')">
              <span>Drink</span>
              <span aria-hidden="true" class="icon">🥤</span>
            </button>
          </div>
        </label>

        <div *ngIf="showErrors && !foodDrinkType" class="error-message">
          Please select food or drink
        </div>

        <div *ngIf="foodDrinkType === 'drink'">
          <label>
            Temperature <span class="required">*</span>
            <div class="segmented" role="group" aria-label="Temperature">
              <button type="button" class="segment" [class.active]="temperature==='hot'" (click)="selectTemperature('hot')">
                <span>Hot</span>
                <span aria-hidden="true" class="icon">☕</span>
              </button>
              <button type="button" class="segment" [class.active]="temperature==='iced'" (click)="selectTemperature('iced')">
                <span>Iced</span>
                <span aria-hidden="true" class="icon">🥤</span>
              </button>
            </div>
          </label>

          <div *ngIf="showErrors && !temperature" class="error-message">
            Please select temperature
          </div>
        </div>

        <label *ngIf="foodDrinkType">
          {{foodDrinkType === 'food' ? 'Food' : 'Drink'}} Name <span class="required">*</span>
          <input name="name" [(ngModel)]="name" (ngModelChange)="onNameChange()" required [placeholder]="'e.g. ' + (foodDrinkType === 'food' ? 'Chicken salad' : 'Coffee')" [class.error]="showErrors && isNameInvalid()" />
        </label>

        <div *ngIf="foodDrinkType && showErrors && isNameInvalid()" class="error-message">
          Please enter the {{foodDrinkType === 'food' ? 'food' : 'drink'}} name
        </div>

        <label>
          Quantity <span class="required">*</span>
          <div class="quantity-input">
            <input name="quantity" [(ngModel)]="quantity" (ngModelChange)="onQuantityChange()" type="number" min="0" step="0.1" placeholder="1" [class.error]="showErrors && isQuantityInvalid()" />
            <select name="quantityUnit" [(ngModel)]="quantityUnit">
              <option value="number">Number</option>
              <option value="grams">Grams</option>
              <option value="ounces">Ounces</option>
              <option value="cups">Cups</option>
              <option value="tablespoons">Tablespoons</option>
              <option value="pieces">Pieces</option>
            </select>
          </div>
        </label>

        <div *ngIf="showErrors && isQuantityInvalid()" class="error-message">
          Please enter a valid quantity greater than 0
        </div>
        <label>
          Notes
          <textarea name="notes" [(ngModel)]="notes" rows="3" placeholder="Optional"></textarea>
        </label>

        <div class="actions">
          <button type="button" class="reset-button" (click)="reset()">Reset</button>
          <button type="submit">Save</button>
        </div>
      </form>

      <!-- Photo Upload Modal -->
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
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M14.828 14.828a4 4 0 0 1-5.656 0"/>
                  <path d="M9 9h.01"/>
                  <path d="M15 9h.01"/>
                  <circle cx="12" cy="12" r="3"/>
                  <path d="m17.196 9-.196-.196-3.804 3.804"/>
                  <path d="M12 2.5V4"/>
                  <path d="m2 12.5 1.5 1.5"/>
                  <path d="M21.5 12l-1.5 1.5"/>
                  <path d="M12 21.5V20"/>
                </svg>
              </div>
              <div class="photo-option-content">
                <h4>Use Camera</h4>
                <p>{{isMobile ? 'Take a photo with your camera' : 'Take a photo using your webcam'}}</p>
              </div>
            </div>
            <div class="photo-option" (click)="uploadFromGallery()">
              <div class="photo-option-icon">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <rect x="2" y="3" width="20" height="14" rx="2" ry="2"/>
                  <line x1="8" y1="21" x2="16" y2="21"/>
                  <line x1="12" y1="17" x2="12" y2="21"/>
                  <path d="M2 6h20"/>
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

      <!-- Reset Confirmation Modal -->
      <div *ngIf="showResetConfirmation" class="modal-overlay" (click)="closeResetModal()">
        <div class="modal" (click)="$event.stopPropagation()">
          <div class="modal-header">
            <h3>Confirm Reset</h3>
            <button type="button" class="close-button" (click)="closeResetModal()" aria-label="Close">
              <span>×</span>
            </button>
          </div>
          <div class="modal-body">
            <p>Are you sure you want to reset the form? All unsaved changes will be lost.</p>
            <div class="modal-actions">
              <button type="button" class="cancel-button" (click)="closeResetModal()">Cancel</button>
              <button type="button" class="confirm-button" (click)="confirmReset()">Reset Form</button>
            </div>
          </div>
        </div>
      </div>

      <!-- Success Modal -->
      <div *ngIf="showSuccessModal" class="modal-overlay" (click)="closeSuccessModal()">
        <div class="modal success-modal" (click)="$event.stopPropagation()">
          <div class="modal-body">
            <div class="success-badge" aria-hidden="true">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3">
                <polyline points="20 6 10 17 4 12" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </div>
            <h3 class="success-title">Saved Successfully</h3>
            <p class="success-subtitle">Added {{ lastSavedEntry?.name || 'your entry' }} to your diary.</p>
            <div class="success-actions">
              <button type="button" class="primary-button" (click)="goToDiary()">Great</button>
              <button type="button" class="ghost-button" (click)="closeSuccessModal()">Add Another</button>
            </div>
          </div>
        </div>
      </div>
    </section>
  `,
  styles: `
    .log-form { padding: var(--space-4); display:block; }
    h2 { margin-bottom: var(--space-5); }

    /* Photo Upload Area */
    .photo-upload {
      margin-bottom: var(--space-4);
      cursor: pointer;
    }
    .photo-box {
      width: 200px;
      height: 200px; /* Square box */
      border: 2px dashed var(--border);
      border-radius: var(--radius);
      display: flex;
      align-items: center;
      justify-content: center;
      background: color-mix(in srgb, var(--primary) 2%, transparent);
      position: relative;
      overflow: visible; /* Allow remove button to overflow */
      transition: all 0.2s;
      margin: 0 auto; /* Center on mobile */
    }
    .photo-box:hover {
      border-color: var(--primary);
      background: color-mix(in srgb, var(--primary) 5%, transparent);
    }
    .photo-placeholder {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: var(--space-2);
      color: var(--text-muted);
      text-align: center;
      padding: var(--space-4);
    }
    .photo-placeholder svg {
      color: var(--text-muted);
    }
    .photo-placeholder span {
      font-size: 14px;
      font-weight: 500;
    }
    .photo-preview {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }
    .remove-photo {
      position: absolute;
      top: -12px;
      right: -12px;
      width: 24px; /* exact circle size */
      height: 24px; /* exact circle size */
      padding: 0; /* prevent default button padding */
      border-radius: 50%;
      background: #ff4757;
      color: white;
      border: none;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      transition: transform 0.2s, box-shadow 0.2s, background 0.2s;
      box-shadow: 0 2px 6px rgba(255, 71, 87, 0.4);
      z-index: 100;
      font-size: 16px;
      font-weight: bold;
      line-height: 1;
      box-sizing: border-box;
    }
    .remove-photo:hover {
      background: #ff3742;
      transform: scale(1.1);
      box-shadow: 0 4px 8px rgba(255, 71, 87, 0.6);
    }
    .remove-photo:active {
      transform: scale(0.95);
    }

    label { display:block; margin-bottom: var(--space-3); font-size:14px; color:var(--text); font-weight:500; }
    input, textarea, select { width:100%; padding:var(--space-3); border:1px solid var(--border); border-radius:var(--radius); font-size:16px; background:var(--background); }
    /* Improved select UX: custom chevron and spacing */
    select {
      -webkit-appearance: none; /* Safari */
      -moz-appearance: none;    /* Firefox */
      appearance: none;
      padding-right: 44px; /* room for chevron */
      background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%239aa0a6' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'/%3E%3C/svg%3E");
      background-repeat: no-repeat;
      background-position: right 12px center;
      background-size: 16px;
    }
    select:focus {
      outline: none;
      border-color: var(--primary);
      box-shadow: 0 0 0 3px color-mix(in srgb, var(--primary) 20%, transparent);
    }

    /* Quantity input styling */
    .quantity-input {
      display: flex;
      gap: var(--space-2);
    }
    .quantity-input input {
      flex: 1;
    }
      .quantity-input select {
        flex: 0 0 120px;
      }

    textarea { resize:vertical; min-height:80px; }
    .actions { display:flex; gap:var(--space-2); margin-top: 32px; }
    .actions > button {
      width: 100%; padding:var(--space-3) var(--space-4); border-radius:var(--radius); border:0;
      font-size:16px; font-weight:600; cursor:pointer;
      min-height: 48px; transition: all 0.2s;
    }
    .actions > button[type="submit"] {
      background:var(--primary); color:#fff;
    }
    .actions > button[type="submit"]:hover { opacity:0.9; transform: translateY(-1px); }
    .actions > button[type="submit"]:active { transform: translateY(0); }
    .actions > button.reset-button {
      background: transparent;
      color: #ff4757;
      border: 1px solid #ff4757;
      border-radius: var(--radius);
      font-weight: 600;
    }
    .actions > button.reset-button:hover {
      background: #ff4757;
      color: #fff;
      border-color: #ff4757;
      transform: translateY(-1px);
    }
    .actions > button.reset-button:active { transform: translateY(0); }
    .actions > button.reset-button:focus-visible {
      outline: 2px solid color-mix(in srgb, #ff4757 30%, transparent);
      outline-offset: 2px;
    }

    /* Required field indicator */
    .required {
      color: #ff4757;
      margin-left: 2px;
    }

    /* Error states */
    input.error, textarea.error, select.error {
      border-color: #ff4757;
      background-color: color-mix(in srgb, #ff4757 5%, transparent);
    }

    .error-message {
      color: #ff4757;
      font-size: 14px;
      margin-top: 4px;
      display: block;
    }

    /* Segmented Button Group */
    
    
    
    

    /* Segmented control */
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

    /* Desktop styles */
    @media (min-width: 768px) {
      .log-form {
        padding: var(--space-5);
        max-width: 600px;
        margin: 0 auto;
      }
      h2 {
        font-size: 24px;
        margin-bottom: var(--space-5);
      }
      .photo-box {
        width: 250px;
        height: 250px; /* Larger square on desktop */
        margin: 0 auto; /* Keep centered */
        overflow: visible; /* Allow remove button to overflow */
      }
      .photo-placeholder span {
        font-size: 16px;
      }
      .remove-photo {
        width: 24px;
        height: 24px;
        top: -12px;
        right: -12px;
        font-size: 16px;
        padding: 0;
        box-sizing: border-box;
      }
      label {
        font-size: 16px;
      }
      input, textarea, select {
        padding: var(--space-4);
        font-size: 16px;
      }
      select {
        padding-right: 52px; /* a bit more room for chevron on desktop */
        background-position: right 16px center;
      }
      .quantity-input select {
        flex: 0 0 140px;
      }
      textarea {
        min-height: 120px;
      }
      .actions > button {
        font-size: 16px;
        min-height: 48px;
      }
      .actions > button.reset-button {
        font-size: 16px;
        min-height: 48px;
        background: transparent;
        color: #ff4757;
        border: 1px solid #ff4757;
        border-radius: var(--radius);
        font-weight: 600;
      }
      .actions > button.reset-button:hover {
        background: #ff4757; color: #fff; border-color: #ff4757;
      }
    }
    select.placeholder {
      color: var(--text-muted);
    }

    /* Photo Modal Styles */
    .photo-modal-overlay {
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

    .photo-modal {
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
      from {
        opacity: 0;
        transform: scale(0.9) translateY(-20px);
      }
      to {
        opacity: 1;
        transform: scale(1) translateY(0);
      }
    }

    .photo-modal-header {
      padding: var(--space-4) var(--space-4) var(--space-3);
      border-bottom: 1px solid var(--border);
      display: flex;
      align-items: center;
      justify-content: space-between;
    }

    .photo-modal-header h3 {
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

    .photo-modal-body {
      padding: var(--space-4);
      display: flex;
      flex-direction: column;
      gap: var(--space-3);
    }

    .photo-option {
      display: flex;
      align-items: center;
      gap: var(--space-4);
      padding: var(--space-4);
      border: 2px solid var(--border);
      border-radius: var(--radius);
      cursor: pointer;
      transition: all 0.2s;
      background: var(--background);
    }

    .photo-option:hover {
      border-color: var(--primary);
      background: color-mix(in srgb, var(--primary) 5%, transparent);
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    }

    .photo-option:active {
      transform: translateY(0);
    }

    .photo-option.clicked {
      opacity: 0.7;
      pointer-events: none;
    }

    .photo-option-icon {
      color: var(--primary);
      flex-shrink: 0;
    }

    .photo-option-content {
      flex: 1;
    }

    .photo-option-content h4 {
      margin: 0 0 4px 0;
      font-size: 16px;
      font-weight: 600;
      color: var(--text);
    }

    .photo-option-content p {
      margin: 0;
      font-size: 14px;
      color: var(--text-muted);
      line-height: 1.4;
    }

    /* Desktop styles for modal */
    @media (min-width: 768px) {
      .photo-modal {
        width: auto;
        min-width: 400px;
      }

      .photo-modal-header {
        padding: var(--space-5) var(--space-5) var(--space-4);
      }

      .photo-modal-header h3 {
        font-size: 22px;
      }

      .photo-modal-body {
        padding: var(--space-5);
        gap: var(--space-4);
      }

      .photo-option {
        padding: var(--space-5);
      }

      .photo-option-content h4 {
        font-size: 18px;
      }

      .photo-option-content p {
        font-size: 15px;
      }
    }

    /* Modal Styles */
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

    .cancel-button {
      background: transparent;
      color: var(--text-muted);
      border: 1px solid var(--border);
    }

    .cancel-button:hover {
      background: var(--border);
      color: var(--text);
    }

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
      min-height: 48px;
    }

    .primary-button:hover {
      background: color-mix(in srgb, var(--primary) 90%, black);
      border-color: color-mix(in srgb, var(--primary) 90%, black);
      transform: translateY(-1px);
    }

    /* Success Modal Styles */
    .success-modal { text-align: center; }
    .success-badge {
      width: 64px; height: 64px; margin: 0 auto var(--space-4);
      border-radius: 999px;
      background: #e9f9ef;
      color: #22c55e;
      display: grid; place-items: center;
      box-shadow: 0 6px 20px rgba(34,197,94,0.25) inset;
      animation: pop-in 180ms ease-out;
    }
    .success-title { font-size: 24px; font-weight: 800; color: var(--text); margin: 0 0 var(--space-2); letter-spacing: -0.02em; }
    .success-subtitle { color: var(--text-muted); margin: 0 0 var(--space-6); font-size: 16px; }
    .success-actions { display: flex; gap: var(--space-2); justify-content: center; }
    .primary-button, .ghost-button { min-width: 140px; }
    .ghost-button { background: transparent; color: var(--text); border: 1px solid var(--border); padding: var(--space-3) var(--space-6); border-radius: var(--radius); font-weight: 600; cursor: pointer; }
    .ghost-button:hover { background: var(--border); }
    @keyframes pop-in { from { transform: scale(0.9); opacity: 0; } to { transform: scale(1); opacity: 1; } }

    /* Desktop styles for modals */
    @media (min-width: 768px) {
      .modal {
        width: auto;
        min-width: 400px;
      }

      .modal-header {
        padding: var(--space-5) var(--space-5) var(--space-4);
      }

      .modal-header h3 {
        font-size: 22px;
      }

      .modal-body {
        padding: var(--space-5);
      }

      .modal-actions button,
      .primary-button {
        font-size: 18px;
        min-height: 56px;
      }

      .success-modal .modal-body {
        padding: var(--space-8) var(--space-5);
      }

      .success-modal h3 {
        font-size: 28px;
        margin-bottom: var(--space-4);
      }

      .success-modal p {
        font-size: 18px;
        margin-bottom: var(--space-6);
      }
    }
  `
})
export class LogPage {
  @ViewChild('fileInput') fileInput!: ElementRef<HTMLInputElement>;
  @ViewChild('cameraInput') cameraInput!: ElementRef<HTMLInputElement>;

  protected name = '';
  protected quantity: string | number = '';
  protected quantityUnit: 'number'|'grams'|'ounces'|'cups'|'tablespoons'|'pieces' = 'pieces';
  protected notes = '';
  protected photoDataUrl: string | undefined;
  protected mealType: 'breakfast'|'lunch'|'dinner'|'snack' = 'snack';
  protected foodDrinkType: ''|'food'|'drink' = '';
  protected temperature: 'hot'|'iced' | undefined = undefined;
  protected showErrors = false;
  protected showPhotoModal = false;
  protected isMobile = false;
  protected cameraOptionClicked = false;
  protected showResetConfirmation = false;
  protected showSuccessModal = false;
  protected lastSavedEntry: FoodEntry | null = null;

  constructor(private data: LocalDataService) {
    this.detectPlatform();
  }

  private detectPlatform() {
    this.isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ||
                   (window.innerWidth <= 768);
  }

  openPhotoModal() {
    this.showPhotoModal = true;
  }

  closePhotoModal() {
    this.showPhotoModal = false;
  }

  useCamera() {
    this.cameraOptionClicked = true;

    // Reset the visual feedback after a short delay
    setTimeout(() => {
      this.cameraOptionClicked = false;
    }, 300);

    this.closePhotoModal();

    // Small delay to ensure modal is closed before opening camera
    setTimeout(() => {
      if (this.cameraInput && this.cameraInput.nativeElement) {
        console.log('Opening camera...');
        this.cameraInput.nativeElement.click();
      } else {
        console.warn('Camera input element not found');
        // Fallback to regular file input
        if (this.fileInput) {
          alert('Camera not available. Please use the "Upload from ' + (this.isMobile ? 'Gallery' : 'Computer') + '" option instead.');
          this.fileInput.nativeElement.click();
        }
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
      this.photoDataUrl = reader.result as string;
      // Close the photo modal after successful upload
      this.closePhotoModal();
      console.log('Image uploaded from gallery successfully');
    };
    reader.readAsDataURL(file);
  }

  onCameraCapture(event: Event) {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) {
      console.warn('No file selected from camera');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      this.photoDataUrl = reader.result as string;
      // Close the photo modal after successful camera capture
      this.closePhotoModal();
      console.log('Camera photo captured successfully');
    };
    reader.onerror = () => {
      console.error('Error reading camera file');
      // Fallback to file upload if camera fails
      if (this.fileInput) {
        alert('Error accessing camera. Please use the "Upload from ' + (this.isMobile ? 'Gallery' : 'Computer') + '" option instead.');
        this.fileInput.nativeElement.click();
      }
    };
    reader.readAsDataURL(file);
  }

  isNameInvalid(): boolean {
    return !this.name || !this.name.toString().trim();
  }

  isQuantityInvalid(): boolean {
    const value = typeof this.quantity === 'number' ? this.quantity : parseFloat((this.quantity || '').toString());
    return Number.isNaN(value) || value <= 0;
  }

  onNameChange() {
    if (this.showErrors && !this.isNameInvalid()) {
      this.showErrors = false;
    }
  }

  onMealTypeChange() {
    if (this.showErrors && this.mealType) {
      this.showErrors = false;
    }
  }

  onFoodDrinkTypeChange() {
    if (this.showErrors && this.foodDrinkType) {
      this.showErrors = false;
    }
    // Clear temperature whenever the type changes; only required for drinks
    this.temperature = undefined;
  }

  selectFoodDrinkType(value: 'food'|'drink') {
    this.foodDrinkType = value;
    // Temperature only applies to drinks; clear it when switching
    this.temperature = value === 'drink' ? this.temperature : undefined;
    if (this.showErrors && this.foodDrinkType) {
      this.showErrors = false;
    }
  }

  selectTemperature(value: 'hot'|'iced') {
    this.temperature = value;
    if (this.showErrors) {
      this.showErrors = false;
    }
  }

  onQuantityChange() {
    if (this.showErrors && !this.isQuantityInvalid()) {
      this.showErrors = false;
    }
  }

  removePhoto(event: Event) {
    event.stopPropagation();
    this.photoDataUrl = undefined;
    // Clear the file input using template reference
    if (this.fileInput) {
      this.fileInput.nativeElement.value = '';
    }
  }

  reset() {
    // Show confirmation modal before resetting
    this.showResetConfirmation = true;
  }

  private clearFormFields() {
    this.name = '';
    this.quantity = '';
    this.quantityUnit = 'pieces';
    this.notes = '';
    this.photoDataUrl = undefined;
    // Keep mealType as-is per requirement
    this.foodDrinkType = '';
    this.temperature = undefined;
    this.showErrors = false;

    // Clear the file inputs
    if (this.fileInput) {
      this.fileInput.nativeElement.value = '';
    }
    if (this.cameraInput) {
      this.cameraInput.nativeElement.value = '';
    }
  }

  confirmReset() {
    // Perform the actual reset
    this.clearFormFields();

    // Close the confirmation modal
    this.showResetConfirmation = false;

    console.log('Form reset');
  }

  closeResetModal() {
    this.showResetConfirmation = false;
  }

  closeSuccessModal() {
    this.showSuccessModal = false;
  }

  save() {
    if (!this.mealType || !this.foodDrinkType || this.isNameInvalid() ||
        this.isQuantityInvalid() ||
        (this.foodDrinkType === 'drink' && !this.temperature)) {
      this.showErrors = true;
      return;
    }
    this.showErrors = false;

    const quantityValueNum = typeof this.quantity === 'number' ? this.quantity : parseFloat((this.quantity || '').toString());

    const entry: Omit<FoodEntry, 'id' | 'createdAt'> = {
      name: this.name.trim(),
      quantity: `${quantityValueNum} ${this.quantityUnit}`,
      notes: this.notes.trim() || undefined,
      photoUrl: this.photoDataUrl,
      mealType: this.mealType,
      foodDrinkType: this.foodDrinkType,
      temperature: this.foodDrinkType === 'drink' ? this.temperature : undefined
    };

    const saved = this.data.add(entry);
    this.lastSavedEntry = saved;

    // Clear form without prompting
    this.clearFormFields();
    this.showResetConfirmation = false;

    // Show success modal and auto-dismiss
    this.showSuccessModal = true;
    // Optional: keep modal until user decides. Remove auto-dismiss.

    // Debug log
    console.log('Saved entry:', entry);
  }

  goToDiary() {
    this.showSuccessModal = false;
    // Navigate to diary daily view; the newest entry appears on top
    window.location.href = '/diary/daily';
  }
}
