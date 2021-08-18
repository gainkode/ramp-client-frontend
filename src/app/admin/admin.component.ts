import { Component } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { Event as NavigationEvent } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { AdminMenuItems } from '../model/admin-menu-list';
import { MatSelectionListChange } from '@angular/material/list/selection-list';
import { User } from '../model/generated-models';
import { MenuItem } from '../model/common.model';

@Component({
    templateUrl: 'admin.component.html',
    styleUrls: ['admin.scss']
})
export class AdminComponent {
    user: User | null = null;
    menuItems: MenuItem[] = AdminMenuItems;
    selectedMenu = 'dashboard';
    editMode = false;
    changeEditModeRef: any;

    constructor(private auth: AuthService, private router: Router) {
        this.user = auth.user;
        this.getSectionName();

        this.router.events.subscribe(
            (event: NavigationEvent): void => {
                if (event instanceof NavigationEnd) {
                    this.getSectionName();
                }
            }
        );
    }

    private getSectionName(): void {
        const routeTree = this.router.parseUrl(this.router.url);
        const segments = routeTree.root.children['primary'].segments;
        if (segments.length > 2) {
            const path1 = segments[0].path;
            const path2 = segments[1].path;
            if (path1 === 'admin' && path2 === 'main') {
                this.selectedMenu = segments[2].path;
            }
        }
    }

    menuChanged(e: MatSelectionListChange): void {
        if (this.editMode === false) {
            const item = e.options[0].value as MenuItem;
            this.router.navigateByUrl(item.url);
        }
    }

    onActivate(component: any): void {
        this.changeEditModeRef = component.changeEditMode;
        if (this.changeEditModeRef !== undefined) {
            this.changeEditModeRef.subscribe((event: any) => {
                const mode = event as boolean;
                this.editMode = mode;
            });
        }
    }

    onDeactivate(component: any): void {
        if (this.changeEditModeRef !== undefined) {
            this.changeEditModeRef.unsubscribe();
        }
    }

    logout(): void {
        this.auth.logout();
    }

    getUserMainPage(): string {
        return this.auth.getUserMainPage();
    }
}
