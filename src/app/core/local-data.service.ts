import { Injectable, signal } from '@angular/core';
import { FoodEntry } from './models';

const STORAGE_KEY = 'pushday.entries.v1';

@Injectable({ providedIn: 'root' })
export class LocalDataService {
  readonly entries = signal<FoodEntry[]>(this.read());

  list(): FoodEntry[] {
    return this.entries();
  }

  getById(id: string): FoodEntry | undefined {
    return this.entries().find(e => e.id === id);
  }

  add(entry: Omit<FoodEntry, 'id' | 'createdAt'>): FoodEntry {
    const newEntry: FoodEntry = {
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
      ...entry
    };
    const next = [newEntry, ...this.entries()];
    this.entries.set(next);
    this.write(next);
    return newEntry;
  }

  remove(id: string): boolean {
    const current = this.entries();
    const filtered = current.filter(entry => entry.id !== id);
    if (filtered.length !== current.length) {
      this.entries.set(filtered);
      this.write(filtered);
      return true;
    }
    return false;
  }

  update(id: string, changes: Partial<FoodEntry>): FoodEntry | undefined {
    const current = this.entries();
    let updatedEntry: FoodEntry | undefined;
    const next = current.map(entry => {
      if (entry.id === id) {
        updatedEntry = { ...entry, ...changes };
        return updatedEntry;
      }
      return entry;
    });
    if (updatedEntry) {
      this.entries.set(next);
      this.write(next);
      return updatedEntry;
    }
    return undefined;
  }

  private read(): FoodEntry[] {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? (JSON.parse(raw) as FoodEntry[]) : [];
    } catch {
      return [];
    }
  }

  private write(entries: FoodEntry[]): void {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
    } catch {
      // ignore
    }
  }
}


