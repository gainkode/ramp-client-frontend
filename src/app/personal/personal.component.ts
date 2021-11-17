import { Component, OnInit } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { Event as NavigationEvent } from '@angular/router';
import { MenuItem } from '../model/common.model';
import { CurrencyView } from '../model/payment.model';
import { ProfileItemActionType, ProfileItemContainer, ProfileItemContainerType } from '../model/profile-item.model';
import {
    PersonalProfileMenuItems,
    PersonalProfilePopupAdministrationMenuItem,
    PersonalProfilePopupMenuItems
} from '../model/profile-menu.model';
import { AuthService } from '../services/auth.service';
import { NotificationService } from '../services/notification.service';
import { PersonalContactsComponent } from './profile/contacts.component';
import { PersonalWalletsComponent } from './profile/wallets.component';

@Component({
    templateUrl: 'personal.component.html',
    styleUrls: ['../../assets/menu.scss', '../../assets/button.scss', '../../assets/profile.scss']
})
export class PersonalComponent implements OnInit {
    menuItems: MenuItem[] = PersonalProfileMenuItems;
    popupItems: MenuItem[] = PersonalProfilePopupMenuItems;
    expandedMenu = false;
    selectedMenu = 'home';
    showDetails = false;
    showDetailsRef: any;
    showPayment = false;
    paymentPanelTitle = '';
    detailsType = '';
    detailsContainer!: ProfileItemContainer;
    dataPanel: any;
    cryptoList: CurrencyView[] = [];

    constructor(
        private auth: AuthService,
        private notification: NotificationService,
        private router: Router) {
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
                    section === 'pricelist' ||
                    section === 'notifications') {
                    this.selectedMenu = section;
                } else {
                    this.router.navigateByUrl(this.menuItems[0].url);
                }
            }
        }
    }

    private initializeDetailsPanel(container: ProfileItemContainer): void {
        this.detailsContainer = container;
        if (container.container === ProfileItemContainerType.Transaction) {
            this.detailsType = 'transaction';
        } else if (container.container === ProfileItemContainerType.Wallet) {
            if (container.wallet) {
                this.detailsType = 'wallet';
            } else {
                this.detailsType = 'new_wallet';
                this.cryptoList = container.meta;
            }
        } else if (container.container === ProfileItemContainerType.Contact) {
            if (container.contact) {
                this.detailsType = 'contact';
            } else {
                this.detailsType = 'new_contact';
                this.cryptoList = container.meta;
            }
        }
        console.log(this.detailsType);
    }

    ngOnInit(): void {
        // side menu expanded state
        const expandedVal = localStorage.getItem('sideMenuExpanded');
        this.expandedMenu = (expandedVal === 'true');
        // Administration menu item
        const adminRole = this.auth.user?.roles?.find(r => r.name === 'ADMIN');
        if (adminRole) {
            const adminMenu = this.popupItems.find(x => x.id === PersonalProfilePopupAdministrationMenuItem.id);
            if (!adminMenu) {
                this.popupItems.splice(0, 0, PersonalProfilePopupAdministrationMenuItem);
            }
        }
    }

    onActivatePage(component: any): void {
        this.dataPanel = component;
        this.showDetailsRef = component.onShowDetails;
        if (this.showDetailsRef) {
            this.showDetailsRef.subscribe((event: any) => {
                const container = event as ProfileItemContainer;
                this.initializeDetailsPanel(container);
                this.showDetails = true;
            });
        }
    }

    onDeactivatePage(component: any): void {
        this.dataPanel = false;
        if (this.showDetailsRef) {
            this.showDetailsRef.unsubscribe();
            this.showDetailsRef = undefined;
        }
    }

    detailsComplete(container: ProfileItemContainer): void {
        if (container.container === ProfileItemContainerType.Wallet && container.wallet) {
            const walletPanel = this.dataPanel as PersonalWalletsComponent;
            if (container.action === ProfileItemActionType.Create) {
                walletPanel.addWallet(container.wallet);
            } else if (container.action === ProfileItemActionType.Remove) {
                walletPanel.removeWallet(container.wallet.vault);
            }
        } else if (container.container === ProfileItemContainerType.Contact) {
            const contactPanel = this.dataPanel as PersonalContactsComponent;
            if (container.action === ProfileItemActionType.Create || container.action === ProfileItemActionType.Remove) {
                contactPanel.update();
            }
        }
        this.closeDetails();
    }

    sideMenuExpanded(state: boolean): void {
        this.expandedMenu = state;
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
        } else if (item.id === 'settings') {
            this.routeTo('/personal/myaccount');
        } else {
            this.routeTo(item.url);
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

    closeDetails(): void {
        this.showDetails = false;
    }

    showPaymentPanel(paymentId: string): void {
        if (paymentId === 'buy-sell') {
            this.paymentPanelTitle = 'BUY or SELL any Crypto Currency using your Bank account directly in a single action!\nIt only takes 2 clicks and you’re done.';
        } else if (paymentId === 'send') {
            this.paymentPanelTitle = 'Send Crypto from your wallet anywhere in one single, easy step!\nSimply add your recepient address to your Contact List, or Insert New Address.';
        } else if (paymentId === 'receive') {
            this.paymentPanelTitle = 'Receive Crypto in your wallet is easy and simple!\nChoose the coin, then wallet to see your deposit wallet address. To aviod coins loss, make sure you use the correct network.';
        }
        this.showPayment = true;
    }

    closePayment(): void {
        this.showPayment = false;
    }

    getChat(): void {
        this.notificationTest();
    }

    notificationTest(): void {
        this.notification.sendTestNotification().subscribe(({ data }) => {
            // data
        }, (error) => {
            // error
        });
    }
}
