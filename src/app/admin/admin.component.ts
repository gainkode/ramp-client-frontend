import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { Validators, FormBuilder } from '@angular/forms';
import { AdminMenuItem, AdminMenuItems } from '../model/admin-menu-list';
import { MatSelectionListChange } from '@angular/material/list/selection-list';

@Component({
    templateUrl: 'admin.component.html',
    styleUrls: ['admin.scss']
})
export class AdminComponent {
    menuItems: AdminMenuItem[] = AdminMenuItems;
    selectedMenu = 'dashboard';

    constructor(private auth: AuthService, private formBuilder: FormBuilder, private router: Router) {
        const routeTree = router.parseUrl(router.url);
        const segments = routeTree.root.children['primary'].segments;
        if (segments.length > 2) {
            this.selectedMenu = segments[2].path;
        } else {
            this.router.navigateByUrl(this.menuItems[0].url);
        }
    }

    menuChanged(e: MatSelectionListChange): void {
        let item = e.options[0].value as AdminMenuItem;
        this.router.navigateByUrl(item.url);
    }

    logout(): void {
        this.auth.logout();
    }
}
