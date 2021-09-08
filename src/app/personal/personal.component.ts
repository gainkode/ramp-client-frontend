import { Component, OnInit } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { Event as NavigationEvent } from '@angular/router';
import { MenuItem } from '../model/common.model';
import {
    PersonalProfileMenuItems,
    PersonalProfilePopupAdministrationMenuItem,
    PersonalProfilePopupMenuItems
} from '../model/profile-menu.model';
import { AuthService } from '../services/auth.service';
import { NotificationService } from '../services/notification.service';

@Component({
    templateUrl: 'personal.component.html',
    styleUrls: ['../menu.scss', '../button.scss', '../profile.scss']
})
export class PersonalComponent implements OnInit {
    menuItems: MenuItem[] = PersonalProfileMenuItems;
    popupItems: MenuItem[] = PersonalProfilePopupMenuItems;
    expandedManu = false;
    selectedMenu = 'home';

    constructor(private auth: AuthService, private notification: NotificationService, private router: Router) {
        this.getSectionName();

        this.router.events.subscribe(
            (event: NavigationEvent): void => {
                if (event instanceof NavigationEnd) {
                    this.getSectionName();
                }
            }
        );
    }

    get userName(): string {
        let name = '';
        const user = this.auth.user;
        if (user) {
            name = `${user.firstName ?? ''} ${user.lastName ?? ''}`;
        }
        if (name === ' ') {
            name = user?.email ?? 'No name';
        }
        return name;
    }

    get selectedSection(): string {
        return this.selectedMenu;
    }

    private getSectionName(): void {
        const routeTree = this.router.parseUrl(this.router.url);
        const segments = routeTree.root.children['primary'].segments;
        if (segments.length > 2) {
            const path1 = segments[0].path;
            const path2 = segments[1].path;
            const section = segments[2].path;
            if (path1 === 'personal' && path2 === 'main') {
                if (
                    section === 'home' ||
                    section === 'wallets' ||
                    section === 'contactlist' ||
                    section === 'transactions' ||
                    section === 'swap') {
                    this.selectedMenu = section;
                } else {
                    this.router.navigateByUrl(this.menuItems[0].url);
                }
            }
        }
    }

    ngOnInit(): void {
        // side menu expanded state
        const expandedVal = localStorage.getItem('sideMenuExpanded');
        this.expandedManu = (expandedVal === 'true');
        // Administration menu item
        const adminRole = this.auth.user?.roles?.find(r => r.name === 'ADMIN');
        if (adminRole) {
            const adminMenu = this.popupItems.find(x => x.id === PersonalProfilePopupAdministrationMenuItem.id);
            if (!adminMenu) {
                this.popupItems.splice(0, 0, PersonalProfilePopupAdministrationMenuItem);
            }
        }
    }

    sideMenuExpanded(state: boolean): void {
        this.expandedManu = state;
        if (state === true) {
            localStorage.setItem('sideMenuExpanded', 'true');
        } else {
            localStorage.setItem('sideMenuExpanded', 'false');
        }
    }

    popupMenuClick(item: MenuItem): void {
        if (item.id === 'logout') {
            this.logout();
        } else if (item.id === 'administration') {
            this.routeTo('/admin/main');
        } else if (item.id === 'notifications') {
            this.notificationTest();
        }
    }

    sideMenuClick(item: MenuItem): void {
        this.router.navigateByUrl(item.url);
    }

    routeTo(link: string): void {
        const urlBlocks = link.split('/');
        if (urlBlocks.length > 0) {
            this.selectedMenu = urlBlocks[urlBlocks.length - 1];
        }
        this.router.navigateByUrl(link);
    }

    logout(): void {
        this.auth.logout();
        this.router.navigateByUrl('/');
    }

    getUserMainPage(): string {
        return this.auth.getUserMainPage();
    }

    notificationTest(): void {
        this.notification.sendTestNotification().subscribe(({ data }) => {
            // data
        }, (error) => {
            // error
        });
    }
}
