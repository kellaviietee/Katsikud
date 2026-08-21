import { Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { GiftService } from './services/gift.service';
import { AddGiftComponent } from './components/add-gift/add-gift';
import { GiftListComponent } from './components/gift-list/gift-list';

@Component({
  selector: 'app-root',
  imports: [FormsModule, AddGiftComponent, GiftListComponent],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App {
  protected readonly giftService = inject(GiftService);
  protected readonly editMode = signal(false);
  protected readonly copied = signal(false);
  // Whether a guest (non-owner) has opened the "add a gift" form, when the owner allows it.
  protected readonly guestAdding = signal(false);
  protected readonly canAdd = computed(
    () => this.editMode() || (this.giftService.allowGuestAdd() && this.guestAdding())
  );

  protected readonly editingTitle = signal(false);
  protected titleInput = '';

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

  addGift(event: { name: string; urls: string[] }): void {
    this.giftService.addGift(event.name, event.urls);
  }

  removeGift(id: string): void {
    this.giftService.removeGift(id);
  }

  async copyShareLink(): Promise<void> {
    await navigator.clipboard.writeText(this.giftService.getShareUrl());
    this.copied.set(true);
    setTimeout(() => this.copied.set(false), 2500);
  }

  async createNewRegistry(): Promise<void> {
    this.giftService.noRegistry.set(false);
    this.giftService.loading.set(true);
    this.editMode.set(true);
    const id = await this.giftService.createRegistry();
    const newUrl = `${window.location.pathname}?edit=1&r=${id}`;
    history.replaceState(null, '', newUrl);
  }

  toggleAllowGuestAdd(event: Event): void {
    const checked = (event.target as HTMLInputElement).checked;
    this.giftService.setAllowGuestAdd(checked);
  }

  toggleGuestAdding(): void {
    this.guestAdding.update(v => !v);
  }

  startEditTitle(): void {
    this.titleInput = this.giftService.title();
    this.editingTitle.set(true);
  }

  cancelEditTitle(): void {
    this.editingTitle.set(false);
  }

  saveTitle(): void {
    this.giftService.setTitle(this.titleInput);
    this.editingTitle.set(false);
  }

  async deleteRegistry(): Promise<void> {
    const confirmed = window.confirm(
      'Kas oled kindel, et soovid kogu kinginimekirja kustutada? Seda ei saa tagasi võtta.'
    );
    if (!confirmed) return;

    await this.giftService.deleteRegistry();
    this.editMode.set(false);
    this.guestAdding.set(false);
    this.editingTitle.set(false);
    this.giftService.noRegistry.set(true);
    history.replaceState(null, '', window.location.pathname);
  }
}
