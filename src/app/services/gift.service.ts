import { Injectable, signal } from '@angular/core';
import { Gift } from '../models/gift.model';

const GIFTS_KEY = 'katsikud-gifts';
const TICKED_KEY = 'katsikud-ticked';

@Injectable({ providedIn: 'root' })
export class GiftService {
  readonly gifts = signal<Gift[]>([]);
  readonly tickedIds = signal<Set<string>>(new Set());

  constructor() {
    this.loadFromUrlOrStorage();
    this.loadTicks();
  }

  private loadFromUrlOrStorage(): void {
    const hash = window.location.hash;
    if (hash.startsWith('#gifts=')) {
      const encoded = hash.slice('#gifts='.length);
      try {
        const decoded = atob(encoded);
        const gifts = JSON.parse(decoded) as Gift[];
        this.gifts.set(gifts);
        this.saveGifts();
        // Remove hash from URL so it stays clean
        history.replaceState(null, '', window.location.pathname + window.location.search);
      } catch {
        this.loadFromStorage();
      }
    } else {
      this.loadFromStorage();
    }
  }

  private loadFromStorage(): void {
    try {
      const stored = localStorage.getItem(GIFTS_KEY);
      if (stored) {
        this.gifts.set(JSON.parse(stored));
      }
    } catch { /* ignore */ }
  }

  private loadTicks(): void {
    try {
      const stored = localStorage.getItem(TICKED_KEY);
      if (stored) {
        this.tickedIds.set(new Set(JSON.parse(stored) as string[]));
      }
    } catch { /* ignore */ }
  }

  private saveGifts(): void {
    localStorage.setItem(GIFTS_KEY, JSON.stringify(this.gifts()));
  }

  private saveTicks(): void {
    localStorage.setItem(TICKED_KEY, JSON.stringify([...this.tickedIds()]));
  }

  addGift(name: string, url?: string): void {
    const gift: Gift = {
      id: crypto.randomUUID(),
      name: name.trim(),
      url: url?.trim() || undefined,
    };
    this.gifts.update(g => [...g, gift]);
    this.saveGifts();
  }

  removeGift(id: string): void {
    this.gifts.update(g => g.filter(gift => gift.id !== id));
    this.tickedIds.update(ids => {
      const next = new Set(ids);
      next.delete(id);
      return next;
    });
    this.saveGifts();
    this.saveTicks();
  }

  toggleTick(id: string): void {
    this.tickedIds.update(ids => {
      const next = new Set(ids);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
    this.saveTicks();
  }

  getShareUrl(): string {
    const encoded = btoa(JSON.stringify(this.gifts()));
    const base = window.location.origin + window.location.pathname;
    return `${base}#gifts=${encoded}`;
  }
}

