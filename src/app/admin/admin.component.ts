import { DOCUMENT } from '@angular/common';
import { Component, Inject } from '@angular/core';
import { Subject } from 'rxjs';
import { EnvService } from '../services/env.service';
import { SwitcherService } from './services/switcher.service';

@Component({
  selector: 'app-admin-new',
  templateUrl: 'admin.component.html',
  styleUrls: ['admin.component.scss']
})
export class AdminComponent {
  private destroy$ = new Subject();

  constructor(
    @Inject(DOCUMENT) private document: Document,
    public switcherService: SwitcherService,
  ) {
    this.loadFont();
    const body = document.querySelector('body');
    if (!body?.classList.contains('app')) {
      document.querySelector('body')?.classList.add('main-body');
      document.querySelector('body')?.classList.add('app');
      document.querySelector('body')?.classList.add('sidebar-mini');
    }
  }

  toggleSwitcherBody() {
    this.switcherService.emitChange(false);
  }

  private loadFont(){
    const head = this.document.getElementsByTagName('head')[0];
    const themeLink = this.document.getElementById('admin-font') as HTMLLinkElement;
    // Set the font link
    const adminFont = EnvService.admin_font;
    const adminFontJoined = adminFont.replace(' ', '+');
    const fontRef = `https://fonts.googleapis.com/css2?family=${adminFontJoined}:ital,wght@0,300;0,400;0,500;0,700;1,300;1,400;1,500;1,700&display=swap`;
    if (themeLink) {
      themeLink.href = fontRef;
    } else {
      // if link doesn't exist, we create link tag
      const style = this.document.createElement('link');
      style.id = 'admin-font';
      style.rel = 'stylesheet';
      style.href = fontRef;
      head.appendChild(style);
    }
    this.document.documentElement.style.setProperty('--font_admin', adminFont);
  }
}
