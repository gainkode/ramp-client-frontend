import { Component, OnInit } from '@angular/core';
import { MatSelectionListChange } from '@angular/material/list';
import { NavigationEnd, Router } from '@angular/router';
import { Event as NavigationEvent } from '@angular/router';
import { MenuItem } from '../model/common.model';
import { PersonalProfileMenuItems, PersonalProfilePopupMenuItems } from '../model/profile-menu.model';
import { AuthService } from '../services/auth.service';
import { NotificationService } from '../services/notification.service';

@Component({
    templateUrl: 'personal.component.html',
    styleUrls: ['../menu.scss', 'personal.component.scss']
})
export class PersonalComponent implements OnInit {
    menuItems: MenuItem[] = PersonalProfileMenuItems;
    popupItems: MenuItem[] = PersonalProfilePopupMenuItems;
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
                    section === 'myaccount' ||
                    section === 'mycontacts' ||
                    section === 'transactions' ||
                    section === 'exchanger') {
                    this.selectedMenu = section;
                } else {
                    this.router.navigateByUrl(this.menuItems[0].url);
                }
            }
        }
    }

    ngOnInit(): void {
        this.notification.subscribeToNotifications().subscribe(({ data }) => {
            // got data
        }, (error) => {
            // there was an error subscribing to notifications
        });
    }

    menuChanged(e: MatSelectionListChange): void {
        const item = e.options[0].value as MenuItem;
        this.router.navigateByUrl(item.url);
    }

    popupMenuClick(item: MenuItem): void {
        if (item.id === 'logout') {
            this.logout();
        }
    }

    routeTo(link: string): void {
        const urlBlocks = link.split('/');
        if (urlBlocks.length > 0) {
            this.selectedMenu = urlBlocks[urlBlocks.length - 1];
        }
        this.router.navigateByUrl(link);
    }

    logout(): void {
        console.log('logout');
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
