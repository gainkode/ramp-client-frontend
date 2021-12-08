import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  templateUrl: 'settings.component.html'
})
export class AdminSettingsComponent {
  selectedTab = 0;
  
  constructor(private router: Router) {
  }

  setSelectedTab(index: number): void {
    this.selectedTab = index;
  }
}
