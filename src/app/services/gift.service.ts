import { Injectable, signal } from '@angular/core';
import { initializeApp } from 'firebase/app';
import {
  getDatabase,
  ref,
  set,
  push,
  remove,
  onValue,
  DataSnapshot,
} from 'firebase/database';
import { environment } from '../../environments/environment';
import { Gift } from '../models/gift.model';

@Injectable({ providedIn: 'root' })
export class GiftService {
  readonly gifts = signal<Gift[]>([]);
  readonly tickedIds = signal<Set<string>>(new Set());
  readonly registryId = signal<string>('');
  readonly loading = signal<boolean>(true);
  readonly noRegistry = signal<boolean>(false);
  readonly allowGuestAdd = signal<boolean>(false);

  private readonly db = getDatabase(initializeApp(environment.firebase));

  loadRegistry(id: string): void {
    this.registryId.set(id);
    this.loading.set(true);

    onValue(ref(this.db, `registries/${id}/gifts`), (snap: DataSnapshot) => {
      const data = snap.val();
      if (data) {
        this.gifts.set(
          Object.entries(data).map(([key, val]: [string, any]) => ({
            id: key,
            name: val.name as string,
            urls: Array.isArray(val.urls)
              ? (val.urls as string[]).filter(Boolean)
              : val.url
                ? [val.url as string]
                : [],
          }))
        );
      } else {
        this.gifts.set([]);
      }
      this.loading.set(false);
    });

    onValue(ref(this.db, `registries/${id}/ticks`), (snap: DataSnapshot) => {
      const data = snap.val();
      this.tickedIds.set(
        data ? new Set(Object.keys(data).filter(k => data[k] === true)) : new Set()
      );
    });

    onValue(ref(this.db, `registries/${id}/meta/allowGuestAdd`), (snap: DataSnapshot) => {
      this.allowGuestAdd.set(snap.val() === true);
    });
  }

  async createRegistry(): Promise<string> {
    const id = Math.random().toString(36).slice(2, 10);
    await set(ref(this.db, `registries/${id}/meta`), { created: Date.now(), allowGuestAdd: false });
    this.loadRegistry(id);
    return id;
  }

  async setAllowGuestAdd(allow: boolean): Promise<void> {
    await set(ref(this.db, `registries/${this.registryId()}/meta/allowGuestAdd`), allow);
  }

  async deleteRegistry(): Promise<void> {
    const id = this.registryId();
    await remove(ref(this.db, `registries/${id}`));
    this.gifts.set([]);
    this.tickedIds.set(new Set());
    this.registryId.set('');
    this.allowGuestAdd.set(false);
  }

  async addGift(name: string, urls: string[] = []): Promise<void> {
    const giftsRef = ref(this.db, `registries/${this.registryId()}/gifts`);
    const cleanUrls = urls.map(u => u.trim()).filter(Boolean);
    await push(giftsRef, { name: name.trim(), urls: cleanUrls });
  }

  async removeGift(giftId: string): Promise<void> {
    const id = this.registryId();
    await remove(ref(this.db, `registries/${id}/gifts/${giftId}`));
    await remove(ref(this.db, `registries/${id}/ticks/${giftId}`));
  }

  async toggleTick(giftId: string): Promise<void> {
    const tickRef = ref(this.db, `registries/${this.registryId()}/ticks/${giftId}`);
    if (this.tickedIds().has(giftId)) {
      await remove(tickRef);
    } else {
      await set(tickRef, true);
    }
  }

  getShareUrl(): string {
    const base = window.location.origin + window.location.pathname;
    return `${base}?r=${this.registryId()}`;
  }
}

