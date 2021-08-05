import { Component, EventEmitter, Input, Output } from '@angular/core';
import { MatSlideToggleChange } from '@angular/material/slide-toggle';

@Component({
  selector: 'app-two-fa',
  templateUrl: './profile-two-fa.component.html'
})
export class ProfileTwoFAComponent {
  @Input() set enabled(val: boolean) {
    this.globalEnabled = val;
    this.twoFaEnabled = this.globalEnabled;
  }
  @Output() twoFaChanged = new EventEmitter<void>();

  twoFaEnabled = false;

  private globalEnabled = false;

  get enabled(): boolean {
    return this.globalEnabled;
  }

  enabledChange(event: MatSlideToggleChange): void {
    this.twoFaEnabled = event.checked;
  }

  twoFaUpdated(): void {
    this.twoFaChanged.emit();
  }
}
