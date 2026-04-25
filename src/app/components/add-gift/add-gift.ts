import { Component, output } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-add-gift',
  imports: [FormsModule],
  templateUrl: './add-gift.html',
  styleUrl: './add-gift.css',
})
export class AddGiftComponent {
  readonly add = output<{ name: string; url?: string }>();

  name = '';
  url = '';

  submit(): void {
    const trimmedName = this.name.trim();
    if (!trimmedName) return;
    this.add.emit({ name: trimmedName, url: this.url.trim() || undefined });
    this.name = '';
    this.url = '';
  }
}

