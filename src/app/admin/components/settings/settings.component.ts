import { Component } from '@angular/core';
import { AuthService } from 'src/app/services/auth.service';

@Component({
  templateUrl: 'settings.component.html'
})
export class AdminSettingsComponent {
  permission = 0;
  selectedTab = 0;
  
  constructor(private auth: AuthService) {
    this.permission = this.auth.isPermittedObjectCode('SETTINGS');
  }

  setSelectedTab(index: number): void {
    this.selectedTab = index;
  }
}
