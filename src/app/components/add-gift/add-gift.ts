import { Component, output } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-add-gift',
  imports: [FormsModule],
  templateUrl: './add-gift.html',
  styleUrl: './add-gift.css',
})
export class AddGiftComponent {
  readonly add = output<{ name: string; urls: string[] }>();

  name = '';
  urls: string[] = [''];

  addUrlField(): void {
    this.urls.push('');
  }

  removeUrlField(index: number): void {
    this.urls.splice(index, 1);
    if (this.urls.length === 0) this.urls.push('');
  }

  submit(): void {
    const trimmedName = this.name.trim();
    if (!trimmedName) return;
    const cleanUrls = this.urls.map(u => u.trim()).filter(Boolean);
    this.add.emit({ name: trimmedName, urls: cleanUrls });
    this.name = '';
    this.urls = [''];
  }
}

