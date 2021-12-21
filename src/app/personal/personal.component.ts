import { Component, OnDestroy, OnInit } from '@angular/core';
import { NavigationEnd, Router, Event as NavigationEvent } from '@angular/router';
import { Subscription } from 'rxjs';
import { MenuItem } from '../model/common.model';
import { CurrencyView, PaymentCompleteDetails, PaymentWidgetType } from '../model/payment.model';
import { ProfileItemActionType, ProfileItemContainer, ProfileItemContainerType } from '../model/profile-item.model';
import {
    PersonalProfileMenuItems,
    ProfilePopupAdministrationMenuItem,
    PersonalProfilePopupMenuItems
} from '../model/profile-menu.model';
import { ProfileContactsComponent } from '../profile/contacts/contacts.component';
import { ProfileWalletsComponent } from '../profile/wallets/wallets.component';
import { AuthService } from '../services/auth.service';
import { NotificationService } from '../services/notification.service';
import { getAvatarPath } from '../utils/utils';

@Component({
    templateUrl: 'personal.component.html',
    styleUrls: [
        '../../assets/menu.scss',
        '../../assets/button.scss',
        '../../assets/profile.scss',
        '../../assets/details.scss'
    ]
})
export class PersonalComponent implements OnInit, OnDestroy {
    menuItems: MenuItem[] = PersonalProfileMenuItems;
    popupItems: MenuItem[] = PersonalProfilePopupMenuItems;
    WIDGET_TYPE: typeof PaymentWidgetType = PaymentWidgetType;
    errorMessage = '';
    avatar = '';
    expandedMenu = false;
    selectedMenu = 'home';
    showDetails = false;
    showDetailsRef: any;
    showErrorRef: any;
    updateAvatarRef: any;
    showPayment = false;
    paymentPanelTitle = '';
    selectedPaymentType = PaymentWidgetType.None;
    riskWarningText = '';
    detailsType = '';
    detailsContainer!: ProfileItemContainer;
    dataPanel: any;
    cryptoList: CurrencyView[] = [];
    paymentCompleteDetails: PaymentCompleteDetails | undefined = undefined;
    presetContactId = '';
    presetCurrency = '';
    presetWalletId = '';
    riskWarningQuoteText = 'The final crypto quote will be based on the asset\'s price at the time of order completion, the final rate will be presented to you in the order confirmation screen.';
    riskWarningNatureText = 'Please note that due to the nature of Crypto currencies, once your order has been submitted we will not be able to reverse it.';

    private subscriptions: Subscription = new Subscription();

    constructor(
        private auth: AuthService,
        private notification: NotificationService,
        public router: Router) {
        this.getSectionName();
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

    ngOnInit(): void {
        // route change detection
        this.subscriptions.add(
            this.router.events.subscribe(
                (event: NavigationEvent): void => {
                    if (event instanceof NavigationEnd) {
                        this.getSectionName();
                    }
                }
            )
        );
        // side menu expanded state
        const expandedVal = localStorage.getItem('sideMenuExpanded');
        this.expandedMenu = (expandedVal === 'true');
        // Administration menu item
        const adminRole = this.auth.user?.roles?.find(r => r.name === 'ADMIN');
        if (adminRole) {
            const adminMenu = this.popupItems.find(x => x.id === ProfilePopupAdministrationMenuItem.id);
            if (!adminMenu) {
                this.popupItems.splice(0, 0, ProfilePopupAdministrationMenuItem);
            }
        }
        this.loadAvatar(undefined);
    }

    ngOnDestroy(): void {
        this.subscriptions.unsubscribe();
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
        this.showErrorRef = component.onShowError;
        if (this.showErrorRef) {
            this.showErrorRef.subscribe((event: any) => {
                this.errorMessage = event as string;
            });
        }
        this.updateAvatarRef = component.onUpdateAvatar;
        if (this.updateAvatarRef) {
            this.updateAvatarRef.subscribe((event: any) => {
                this.loadAvatar(event as string);
            });
        }
    }

    onDeactivatePage(component: any): void {
        this.dataPanel = false;
        if (this.showDetailsRef) {
            this.showDetailsRef.unsubscribe();
            this.showDetailsRef = undefined;
        }
        if (this.showErrorRef) {
            this.showErrorRef.unsubscribe();
            this.showErrorRef = undefined;
        }
        if (this.updateAvatarRef) {
            this.updateAvatarRef.unsubscribe();
            this.updateAvatarRef = undefined;
        }
    }

    private getSectionName(): void {
        const routeTree = this.router.parseUrl(this.router.url);
        const segments = routeTree.root.children['primary'].segments;
        if (segments.length > 2) {
            const path1 = segments[0].path;
            const path2 = segments[1].path;
            const section = segments[2].path;
            let personalVerified = false;
            if (path1 === 'personal' && path2 === 'main') {
                if (section === 'home' || section === 'wallets' || section === 'contactlist' || section === 'transactions' || section === 'pricelist') {
                    personalVerified = true;
                }
            }
            if (personalVerified === false && path1 === 'personal' && path2 === 'account') {
                if (section === 'settings' || section === 'notifications') {
                    personalVerified = true;
                }
            }
            if (personalVerified === true) {
                this.selectedMenu = section;
            } else {
                this.router.navigateByUrl(this.menuItems[0].url);
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
        } else if (container.container === ProfileItemContainerType.PaymentComplete) {
            this.detailsType = 'payment_complete';
            this.paymentCompleteDetails = container.paymentDetails;
        }
    }

    loadAvatar(path: string | undefined): void {
        this.avatar = (path) ? path : getAvatarPath(this.auth.user?.avatar ?? undefined);
    }

    closeErrorBar(): void {
        this.errorMessage = '';
    }

    detailsComplete(container: ProfileItemContainer): void {
        if (container.container === ProfileItemContainerType.Wallet && container.wallet) {
            const walletPanel = this.dataPanel as ProfileWalletsComponent;
            if (container.action === ProfileItemActionType.Create) {
                walletPanel.addWallet(container.wallet);
            } else if (container.action === ProfileItemActionType.Remove) {
                walletPanel.removeWallet(container.wallet.vault);
            } else if (container.action === ProfileItemActionType.Redirect) {
                this.presetCurrency = container.wallet?.asset ?? '';
                this.presetWalletId = container.wallet?.id ?? '';
                const meta = container.meta as string;
                if (meta === 'send') {
                    this.showPaymentPanel(PaymentWidgetType.Send);
                } else {
                    this.showPaymentPanel(PaymentWidgetType.Receive);
                }
            }
        } else if (container.container === ProfileItemContainerType.Contact) {
            const contactPanel = this.dataPanel as ProfileContactsComponent;
            if (container.action === ProfileItemActionType.Create || container.action === ProfileItemActionType.Remove) {
                contactPanel.update();
            } else if (container.action === ProfileItemActionType.Redirect) {
                this.presetCurrency = container.contact?.asset ?? '';
                this.presetContactId = container.contact?.id ?? '';
                const meta = container.meta as string;
                if (meta === 'send') {
                    this.showPaymentPanel(PaymentWidgetType.Send);
                } else {
                    this.showPaymentPanel(PaymentWidgetType.Receive);
                }
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
        this.router.navigateByUrl('/personal/intro').then(() => {
            window.location.reload();
        });
    }

    getUserMainPage(): string {
        return this.auth.getUserMainPage();
    }

    closeDetails(): void {
        this.showDetails = false;
    }

    showPaymentPanel(paymentId: PaymentWidgetType): void {
        this.closeDetails();
        this.selectedPaymentType = paymentId;
        if (paymentId === PaymentWidgetType.Buy || paymentId === PaymentWidgetType.Sell) {
            this.paymentPanelTitle = 'BUY or SELL any Crypto Currency using your Bank account directly in a single action!\nIt only takes 2 clicks and you’re done.';
            this.riskWarningText = `${this.riskWarningQuoteText}\n${this.riskWarningNatureText}`;
        } else if (paymentId === PaymentWidgetType.Send) {
            this.paymentPanelTitle = 'Send Crypto from your wallet anywhere in one single, easy step!\nSimply add your recepient address to your Contact List, or Insert New Address.';
            this.riskWarningText = this.riskWarningNatureText;
        } else if (paymentId === PaymentWidgetType.Receive) {
            this.paymentPanelTitle = 'Receive Crypto in your wallet is easy and simple!\nChoose the coin, then wallet to see your deposit wallet address. To aviod coins loss, make sure you use the correct network.';
            this.riskWarningText = this.riskWarningNatureText;
        } else if (paymentId === PaymentWidgetType.Transfer) {
            this.paymentPanelTitle = 'Express Transfer allowing you with a single action to Purchase & Send Crypto direclty from your Bank account to any address!\nIt only takes 2 clicks and you’re done.';
            this.riskWarningText = this.riskWarningNatureText;
        }
        this.showPayment = true;
    }

    closePayment(): void {
        this.showPayment = false;
    }

    widgetComplete(details: PaymentCompleteDetails): void {
        this.closePayment();
        const container = new ProfileItemContainer();
        container.container = ProfileItemContainerType.PaymentComplete;
        container.paymentDetails = details;
        this.initializeDetailsPanel(container);
        this.showDetails = true;
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
