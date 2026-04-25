import { Component, inject, signal } from '@angular/core';
import { GiftService } from './services/gift.service';
import { AddGiftComponent } from './components/add-gift/add-gift';
import { GiftListComponent } from './components/gift-list/gift-list';

@Component({
  selector: 'app-root',
  imports: [AddGiftComponent, GiftListComponent],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App {
  protected readonly giftService = inject(GiftService);
  protected readonly editMode = signal(false);
  protected readonly copied = signal(false);

  constructor() {
    const params = new URLSearchParams(window.location.search);
    this.editMode.set(params.has('edit'));
  }

  addGift(event: { name: string; url?: string }): void {
    this.giftService.addGift(event.name, event.url);
  }

  removeGift(id: string): void {
    this.giftService.removeGift(id);
  }

  async copyShareLink(): Promise<void> {
    await navigator.clipboard.writeText(this.giftService.getShareUrl());
    this.copied.set(true);
    setTimeout(() => this.copied.set(false), 2500);
  }
}
