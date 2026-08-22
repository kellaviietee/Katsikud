import { Component, computed, inject, input, output, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Gift } from '../../models/gift.model';
import { GiftService } from '../../services/gift.service';

@Component({
  selector: 'app-gift-item',
  imports: [FormsModule],
  templateUrl: './gift-item.html',
  styleUrl: './gift-item.css',
})
export class GiftItemComponent {
  readonly gift = input.required<Gift>();
  readonly editMode = input<boolean>(false);
  readonly guestSessionId = input<string>('');
  readonly remove = output<string>();

  private readonly giftService = inject(GiftService);

  readonly ticked = computed(() => this.giftService.tickedIds().has(this.gift().id));

  /** Owner (editMode) can manage any gift; a guest can manage only the gift they added. */
  readonly canManage = computed(
    () =>
      this.editMode() ||
      (!!this.gift().addedBy && this.gift().addedBy === this.guestSessionId())
  );

  readonly editing = signal(false);
  editName = '';
  editUrls: string[] = [''];

  toggle(): void {
    this.giftService.toggleTick(this.gift().id);
  }

  onRemove(): void {
    this.remove.emit(this.gift().id);
  }

  startEdit(): void {
    this.editName = this.gift().name;
    const urls = this.gift().urls;
    this.editUrls = urls && urls.length > 0 ? [...urls] : [''];
    this.editing.set(true);
  }

  cancelEdit(): void {
    this.editing.set(false);
  }

  addUrlField(): void {
    this.editUrls.push('');
  }

  removeUrlField(index: number): void {
    this.editUrls.splice(index, 1);
    if (this.editUrls.length === 0) this.editUrls.push('');
  }

  saveEdit(): void {
    const trimmedName = this.editName.trim();
    if (!trimmedName) return;
    const cleanUrls = this.editUrls.map(u => u.trim()).filter(Boolean);
    this.giftService.updateGift(this.gift().id, trimmedName, cleanUrls);
    this.editing.set(false);
  }
}

