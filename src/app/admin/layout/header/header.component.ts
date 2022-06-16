import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/services/auth.service';
import { EnvService } from 'src/app/services/env.service';
import { LayoutService } from '../../services/layout.service';
import { NavService } from '../../services/nav.service';
import { SwitcherService } from '../../services/switcher.service';

@Component({
  selector: 'app-admin-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
})
export class AdminHeaderComponent implements OnInit {
  private body: HTMLBodyElement | any = document.querySelector('body');
  public isCollapsed = true;
  activated: boolean = false;
  logoSrc = `${EnvService.image_host}/images/logo-dark.png`;

  constructor(
    private layoutService: LayoutService,
    public SwitcherService: SwitcherService,
    public navServices: NavService,
    private auth: AuthService,
    public router: Router
  ) {}

  ngOnInit(): void {
    
  }

  toggleSwitcher() {
    this.SwitcherService.emitChange(true);
  }
  
  toggleSidebarNotification() {
    this.layoutService.emitSidebarNotifyChange(true);
  }

  goToMainPage() {
    this.router.navigate([this.auth.getUserMainPage()]);
  }

  signout() {
    this.auth.logout();
    this.router.navigate(['/auth/login']);
  }

  searchToggle() {
    if(this.body.classList.contains('search-open')){
      this.activated = false;
      this.body.classList.remove('search-open')
    }
    else{
      this.activated = true;
      this.body.classList.add('search-open')
    }
  }
  closeToggle() { 
    this.activated = false;
    this.body.classList.remove('search-open')
  }
}
