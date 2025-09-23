import { Injectable, signal } from '@angular/core';
import { FoodEntry } from './models';

const SHARED_DIARIES_KEY = 'pushday.shared_diaries.v1';

interface SharedDiary {
  shareId: string;
  entries: FoodEntry[];
  sharedAt: string;
  expiresAt: string;
}

@Injectable({ providedIn: 'root' })
export class SharedDiaryService {
  private readonly sharedDiaries = signal<SharedDiary[]>(this.loadSharedDiaries());

  private loadSharedDiaries(): SharedDiary[] {
    try {
      const raw = localStorage.getItem(SHARED_DIARIES_KEY);
      if (!raw) return [];

      const diaries = JSON.parse(raw) as SharedDiary[];
      // Filter out expired shares
      const now = new Date().toISOString();
      const validDiaries = diaries.filter(diary => diary.expiresAt > now);

      // Clean up expired entries
      if (validDiaries.length !== diaries.length) {
        this.saveSharedDiaries(validDiaries);
      }

      return validDiaries;
    } catch {
      return [];
    }
  }

  private saveSharedDiaries(diaries: SharedDiary[]): void {
    try {
      localStorage.setItem(SHARED_DIARIES_KEY, JSON.stringify(diaries));
      this.sharedDiaries.set(diaries);
    } catch {
      // ignore
    }
  }

  generateShareId(): string {
    return crypto.randomUUID().substring(0, 8); // Use first 8 characters for shorter URL
  }

  createSharedDiary(entries: FoodEntry[]): string {
    const shareId = this.generateShareId();
    const now = new Date();

    const sharedDiary: SharedDiary = {
      shareId,
      entries: entries.map(entry => ({
        ...entry,
        id: crypto.randomUUID() // Regenerate IDs to avoid conflicts
      })),
      sharedAt: now.toISOString(),
      expiresAt: new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000).toISOString() // 30 days
    };

    const current = this.sharedDiaries();
    this.saveSharedDiaries([...current, sharedDiary]);

    return shareId;
  }

  getSharedDiary(shareId: string): SharedDiary | null {
    const diaries = this.sharedDiaries();
    return diaries.find(diary => diary.shareId === shareId) || null;
  }

  getAllSharedDiaries(): SharedDiary[] {
    return this.sharedDiaries();
  }

  revokeSharedDiary(shareId: string): boolean {
    const current = this.sharedDiaries();
    const filtered = current.filter(diary => diary.shareId !== shareId);

    if (filtered.length !== current.length) {
      this.saveSharedDiaries(filtered);
      return true;
    }
    return false;
  }
}
