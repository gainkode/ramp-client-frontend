import { Component, OnInit } from '@angular/core';
import { MatSelectionListChange } from '@angular/material/list';
import { Router } from '@angular/router';
import { MenuItem } from '../model/common.model';
import { PersonalProfileMenuItems } from '../model/profile-menu.model';
import { AuthService } from '../services/auth.service';
import { NotificationService } from '../services/notification.service';

@Component({
    templateUrl: 'personal.component.html',
    styleUrls: ['../menu.scss', 'personal.component.scss']
})
export class PersonalComponent implements OnInit {
    menuItems: MenuItem[] = PersonalProfileMenuItems;
    selectedMenu = 'home';

    constructor(private auth: AuthService, private notification: NotificationService, private router: Router) {
        const routeTree = router.parseUrl(router.url);
        const segments = routeTree.root.children['primary'].segments;
        if (segments.length > 2) {
            this.selectedMenu = segments[2].path;
        } else {
            this.router.navigateByUrl(this.menuItems[0].url);
        }
    }

    get userName(): string {
        let name = '';
        const user = this.auth.user;
        if (user) {
            name = `${user.firstName} ${user.lastName}`;
        }
        return name;
    }

    get selectedSection(): string {
        return this.selectedMenu;
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

    routeTo(link: string): void {
        const urlBlocks = link.split('/');
        if (urlBlocks.length > 0) {
            const s = urlBlocks[urlBlocks.length - 1];
            if (s === 'home' || s === 'myaccount' || s === 'mycontacts' || s === 'transactions' || s === 'exchanger') {
                this.selectedMenu = s;
            }
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
