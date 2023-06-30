import { Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { NavigationEnd, Router, Event as NavigationEvent } from '@angular/router';
import { Subscription } from 'rxjs';
import { MenuItem } from '../model/common.model';
import { PaymentCompleteDetails, PaymentErrorDetails, PaymentWidgetType } from '../model/payment-base.model';
import { CurrencyView } from '../model/payment.model';
import { ProfileItemActionType, ProfileItemContainer, ProfileItemContainerType } from '../model/profile-item.model';
import { MerchantProfileMenuItems, ProfilePopupAdministrationMenuItem, MerchantProfilePopupMenuItems } from '../model/profile-menu.model';
import { ProfileContactsComponent } from '../profile/contacts/contacts.component';
import { ProfileHomeComponent } from '../profile/home/home.component';
import { ProfileTransactionsComponent } from '../profile/transactions/transactions.component';
import { ProfileWalletsComponent } from '../profile/wallets/wallets.component';
import { AuthService } from '../services/auth.service';
import { EnvService } from '../services/env.service';
import { NotificationService } from '../services/notification.service';
import { getAvatarPath, getFullName, getPaymentTitles } from '../utils/utils';

@Component({
	templateUrl: 'merchant.component.html',
	styleUrls: [
		'../../assets/menu.scss',
		'../../assets/profile.scss',
		'../../assets/details.scss'
	]
})
export class MerchantComponent implements OnInit, OnDestroy {
    @ViewChild('top_menu_hamburger_toggle') hamburgerToggle!: ElementRef<HTMLInputElement>;

    menuItems: MenuItem[] = MerchantProfileMenuItems;
    popupItems: MenuItem[] = MerchantProfilePopupMenuItems;
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
    showDepositWithdrawal = false;
    paymentPanelTitle = '';
    selectedPaymentType = PaymentWidgetType.None;
    riskWarningText = '';
    detailsType = '';
    detailsContainer!: ProfileItemContainer;
    dataPanel: any;
    cryptoList: CurrencyView[] = [];
    paymentCompleteDetails: PaymentCompleteDetails | undefined = undefined;
    paymentErrorDetails: PaymentErrorDetails | undefined = undefined;
    presetContactId = '';
    presetCurrency = '';
    presetWalletId = '';
    merchantApproved = false;
    logoSrc = `${EnvService.image_host}/images/logo-light.png`;
    logoAlt = EnvService.product;

    private subscriptions: Subscription = new Subscription();

    constructor(
    	public auth: AuthService,
    	private notification: NotificationService,
    	public router: Router) {
    	this.showDepositWithdrawal = EnvService.deposit_withdrawal;
    	this.merchantApproved = auth.isMerchantApproved();
    	this.getSectionName();
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
    	const adminRole = this.auth.isAuthenticatedUserRole(['MERCHANT', 'MANAGER', 'SUPPORT', 'ADMIN', 'DEMO']);
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

    get userName(): string {
    	return (this.auth.user !== null) ? getFullName(this.auth.user) : '';
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
    		let personalVerified = false;
    		if (path1 === 'merchant' && path2 === 'main') {
    			if (section === 'home' || section === 'wallets' || section === 'contactlist' || section === 'transactions' || section === 'pricelist') {
    				personalVerified = true;
    			}
    		}
    		if (personalVerified === false && path1 === 'merchant' && path2 === 'account') {
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
    	} else if (container.container === ProfileItemContainerType.PaymentError) {
    		this.detailsType = 'payment_error';
    		this.paymentErrorDetails = container.paymentError;
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
    		} else if (container.action === ProfileItemActionType.List) {
    			walletPanel.reload();
    		} else if (container.action === ProfileItemActionType.Remove) {
    			walletPanel.removeWallet(container.wallet.vault);
    		} else if (container.action === ProfileItemActionType.Redirect) {
    			this.presetCurrency = container.wallet?.asset ?? '';
    			this.presetWalletId = container.wallet?.id ?? '';
    			const meta = container.meta as string;
    			if (meta === 'send') {
    				this.showPaymentPanel(PaymentWidgetType.Send);
    			} else if (meta === 'receive') {
    				this.showPaymentPanel(PaymentWidgetType.Receive);
    			} else if (meta === 'deposit') {
    				this.showPaymentPanel(PaymentWidgetType.Deposit);
    			} else if (meta === 'withdrawal') {
    				this.showPaymentPanel(PaymentWidgetType.Withdrawal);
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
    	} else if (container.container === ProfileItemContainerType.PaymentError) {
    		const p = container.paymentError?.paymentType;
    		if (p) {
    			this.showPaymentPanel(p);
    		} else {
    			this.closeDetails();
    		}
    	}
    	if (container.container !== ProfileItemContainerType.PaymentError) {
    		this.closeDetails();
    	}
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
    	} else {
    		this.routeTo(item.url);
    	}
    	this.hamburgerToggle.nativeElement.checked = false;
    }

    sideMenuClick(item: MenuItem): void {
    	this.router.navigateByUrl(item.url);
    	this.hamburgerToggle.nativeElement.checked = false;
    }

    routeTo(link: string): void {
    	let baseLink = link;
    	const urlBlocks = link.split('/');
    	if (urlBlocks.length > 0) {
    		this.selectedMenu = urlBlocks[urlBlocks.length - 1];
    		if (urlBlocks.length > 1) {
    			const selectedSectionPaged = urlBlocks[urlBlocks.length - 2];
    			if (selectedSectionPaged === 'settings') {
    				baseLink = '/';
    			}
    			const selectedSection = urlBlocks[urlBlocks.length - 1];
    			if (selectedSection === 'notifications') {
    				baseLink = '/';
    			}
    		}
    	}
    	this.router.navigateByUrl(baseLink, { skipLocationChange: true }).then(() =>
    		this.router.navigate([link]));
    }

    logout(): void {
    	this.auth.logout();
    	this.router.navigateByUrl('/').then(() => {
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
    	this.hamburgerToggle.nativeElement.checked = false;
    	this.selectedPaymentType = paymentId;
    	const titleData = getPaymentTitles(paymentId);
    	this.paymentPanelTitle = titleData.panelTitle;
    	this.riskWarningText = titleData.riskWarning;
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
    	if (this.selectedMenu === 'transactions') {
    		const transactionPanel = this.dataPanel as ProfileTransactionsComponent;
    		transactionPanel.update();
    	} else if (this.selectedMenu === 'home') {
    		const homePanel = this.dataPanel as ProfileHomeComponent;
    		homePanel.updateHomeData();
    	}
    }

    widgetError(errorDetails: PaymentErrorDetails): void {
    	this.closePayment();
    	const container = new ProfileItemContainer();
    	container.container = ProfileItemContainerType.PaymentError;
    	container.paymentError = errorDetails;
    	this.initializeDetailsPanel(container);
    	this.showDetails = true;
    }

    getChat(): void {
    	this.notificationTest();
    }

    transactionStatusUpdate(transactionId: string): void {
    	if (this.selectedMenu === 'transactions') {
    		const transactionPanel = this.dataPanel as ProfileTransactionsComponent;
    		transactionPanel.updateTransactionStatus(transactionId);
    	} else if (this.selectedMenu === 'home') {
    		const transactionPanel = this.dataPanel as ProfileHomeComponent;
    		transactionPanel.updateTransactionStatus(transactionId);
    	}
    }

    notificationTest(): void {
    	this.subscriptions.add(
    		this.notification.sendTestNotification().subscribe(({ data }) => {
    			// data
    		}, (error) => {
    			// error
    		})
    	);
    }
}
