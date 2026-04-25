import { Component, computed, inject, input, output } from '@angular/core';
import { Gift } from '../../models/gift.model';
import { GiftService } from '../../services/gift.service';

@Component({
  selector: 'app-gift-item',
  templateUrl: './gift-item.html',
  styleUrl: './gift-item.css',
})
export class GiftItemComponent {
  readonly gift = input.required<Gift>();
  readonly editMode = input<boolean>(false);
  readonly remove = output<string>();

  private readonly giftService = inject(GiftService);

  readonly ticked = computed(() => this.giftService.tickedIds().has(this.gift().id));

  toggle(): void {
    this.giftService.toggleTick(this.gift().id);
  }

  onRemove(): void {
    this.remove.emit(this.gift().id);
  }
}

