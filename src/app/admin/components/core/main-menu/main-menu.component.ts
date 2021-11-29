import { Component, OnInit } from '@angular/core';
import { MenuItem } from '../../../../model/common.model';
import { AdminMenuItems } from '../../../model/menu.model';
import { AuthService } from '../../../../services/auth.service';

@Component({
  selector: 'app-main-menu',
  templateUrl: './main-menu.component.html',
  styleUrls: ['./main-menu.component.scss']
})
export class MainMenuComponent implements OnInit {
  menuItems: MenuItem[] = AdminMenuItems;
  userMainPage = '';

  constructor(private auth: AuthService) {
  }

  ngOnInit(): void {
    this.userMainPage = this.auth.getUserMainPage();
  }

  handleLogout(): void {
    this.auth.logout();
  }
}
