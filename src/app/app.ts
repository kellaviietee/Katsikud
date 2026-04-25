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
    const registryId = params.get('r');

    if (registryId) {
      this.giftService.loadRegistry(registryId);
    } else if (this.editMode()) {
      // No registry yet — create one and update the URL
      this.giftService.createRegistry().then(id => {
        const newUrl = `${window.location.pathname}?edit=1&r=${id}`;
        history.replaceState(null, '', newUrl);
      });
    } else {
      // Visitor with no registry ID
      this.giftService.loading.set(false);
      this.giftService.noRegistry.set(true);
    }
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
