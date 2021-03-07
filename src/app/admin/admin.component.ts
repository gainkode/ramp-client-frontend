import { Component, ElementRef } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { AdminMenuItem, AdminMenuItems } from '../model/admin-menu-list';
import { MatSelectionListChange } from '@angular/material/list/selection-list';

@Component({
    templateUrl: 'admin.component.html',
    styleUrls: ['admin.scss']
})
export class AdminComponent {
    menuItems: AdminMenuItem[] = AdminMenuItems;
    selectedMenu = 'dashboard';
    editMode = false;
    changeEditModeRef: any;

    constructor(private auth: AuthService, private router: Router) {
        const routeTree = router.parseUrl(router.url);
        const segments = routeTree.root.children['primary'].segments;
        if (segments.length > 2) {
            this.selectedMenu = segments[2].path;
        } else {
            this.router.navigateByUrl(this.menuItems[0].url);
        }
    }

    menuChanged(e: MatSelectionListChange): void {
        if (this.editMode == false) {
            let item = e.options[0].value as AdminMenuItem;
            this.router.navigateByUrl(item.url);
        } else {

        }
    }

    onActivate(component: any) {
        this.changeEditModeRef = component.changeEditMode;
        this.changeEditModeRef.subscribe((event: any) => {
            const mode = event as boolean;
            this.editMode = mode;
        });
    }

    onDeactivate(component: any) {
        this.changeEditModeRef.unsubscribe();
    }

    logout(): void {
        this.auth.logout();
    }
}
