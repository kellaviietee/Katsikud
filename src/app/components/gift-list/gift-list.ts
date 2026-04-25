import { Component, input, output } from '@angular/core';
import { Gift } from '../../models/gift.model';
import { GiftItemComponent } from '../gift-item/gift-item';

@Component({
  selector: 'app-gift-list',
  imports: [GiftItemComponent],
  templateUrl: './gift-list.html',
  styleUrl: './gift-list.css',
})
export class GiftListComponent {
  readonly gifts = input.required<Gift[]>();
  readonly editMode = input<boolean>(false);
  readonly remove = output<string>();
}

