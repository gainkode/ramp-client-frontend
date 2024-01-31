import { Injectable, OnDestroy } from '@angular/core';
import { Subject, BehaviorSubject, fromEvent } from 'rxjs';
import { takeUntil, debounceTime } from 'rxjs/operators';
import { Router } from '@angular/router';
import { UserRoleObjectCode } from 'model/generated-models';

// Menu
export interface Menu {
	headTitle?: string;
	headTitle2?: string;
	path?: string;
	title?: string;
	icon?: string;
	type?: string;
	badgeType?: string;
	badgeValue?: string;
	badgeClass?: string;
	active?: boolean;
	bookmark?: boolean;
	children?: Menu[];
	code?: string;
}

@Injectable({
	providedIn: 'root'
})

export class NavService implements OnDestroy {
	private unsubscriber: Subject<any> = new Subject();
	public screenWidth: BehaviorSubject<number> = new BehaviorSubject(window.innerWidth);

	// Search Box
	public search = false;

	// Language
	public language = false;

	// Mega Menu
	public megaMenu = false;
	public levelMenu = false;
	public megaMenuColapse: boolean = window.innerWidth < 1199 ? true : false;

	// Collapse Sidebar
	public collapseSidebar: boolean = window.innerWidth < 991 ? true : false;

	// For Horizontal Layout Mobile
	public horizontal: boolean = window.innerWidth < 991 ? false : true;

	// Full screen
	public fullScreen = false;

	constructor(private router: Router) {
		this.setScreenWidth(window.innerWidth);
		fromEvent(window, 'resize').pipe(
			debounceTime(1000),
			takeUntil(this.unsubscriber)
		).subscribe((evt: any) => {
			this.setScreenWidth(evt.target.innerWidth);
			if (evt.target.innerWidth < 991) {
				this.collapseSidebar = true;
				this.megaMenu = false;
				this.levelMenu = false;
			}
			if (evt.target.innerWidth < 1199) {
				this.megaMenuColapse = true;
			}
		});
		if (window.innerWidth < 991) { // Detect Route change sidebar close
			this.router.events.subscribe(event => {
				this.collapseSidebar = true;
				this.megaMenu = false;
				this.levelMenu = false;
			});
		}
	}

	ngOnDestroy(): void {
		this.unsubscriber.next;
		this.unsubscriber.complete();
	}

	private setScreenWidth(width: number): void {
		this.screenWidth.next(width);
	}

	MENUITEMS: Menu[] = [
		{
			headTitle: 'MAIN',
		},
		{
			path: '/admin/dashboard/admin', icon: 'dashboard', title: 'Dashboard', type: 'link', code: UserRoleObjectCode.Dashboard
		},
		{
			path: '/admin/dashboard/merchant', icon: 'dashboard', title: 'Dashboard', type: 'link', code: UserRoleObjectCode.DashboardMerchant
		},
		{
			path: '/admin/transactions', icon: 'compare_arrows', title: 'Transactions', type: 'link', code: UserRoleObjectCode.Transactions
		},
		
		{
			title: 'Users', icon: 'account_box', type: 'sub', active: false, children: [
				{ path: '/admin/customers', title: 'Customers', type: 'link', code: UserRoleObjectCode.Customers },
				{ path: '/admin/system-users', title: 'System users', type: 'link', code: UserRoleObjectCode.SystemUsers },
			]
		},
		{
			title: 'Wallets', icon: 'wallet_membership', type: 'sub', active: false, code: UserRoleObjectCode.Wallets, children: [
				{ path: '/admin/crypto-wallets', title: 'Crypto wallets', type: 'link' },
				{ path: '/admin/fiat-wallets', title: 'FIat wallets', type: 'link' }
			]
		},
		{
			path: '/admin/widgets', icon: 'device_hub', title: 'Widgets', type: 'link', code: UserRoleObjectCode.Widgets
		},
		{
			path: '/admin/notifications', icon: 'notifications', title: 'Notifications', type: 'link', code: UserRoleObjectCode.Notifications
		},
		{
			path: '/admin/emails', icon: 'messages', title: 'Emails', type: 'link', code: UserRoleObjectCode.Messages
		},
		{
			path: '/admin/risk-center', icon: 'bolt', title: 'Risk center', type: 'link', code: UserRoleObjectCode.Risks
		},
		{
			title: 'System logs', icon: 'settings', type: 'sub', active: false, children: [
				{ path: '/admin/user-actions', title: 'User actions', type: 'link', code: UserRoleObjectCode.UserActions },
				{
					path: '/admin/transaction-status-history', icon: 'compare_arrows', title: 'Transaction history', type: 'link', code: UserRoleObjectCode.TransactionHistoryLog
				},
			]
		},
		{
			headTitle: 'SETTINGS',
		},
		{
			path: '/admin/fees', icon: 'payment', title: 'Fees', type: 'link', code: UserRoleObjectCode.Fees
		},
		{
			title: 'Costs', icon: 'attach_money', type: 'sub', active: false, code: UserRoleObjectCode.Costs, children: [
				{ path: '/admin/costs', title: 'Schemes', type: 'link' },
				{ path: '/admin/bank-accounts', title: 'Bank accounts', type: 'link' },
			]
		},
		{
			title: 'KYC / KYB', icon: 'assignment_ind', type: 'sub', active: false, code: UserRoleObjectCode.Kyc, children: [
				{ path: '/admin/levels', title: 'Levels', type: 'link' },
				{ path: '/admin/tiers', title: 'Tiers', type: 'link' },
				{ path: '/admin/black-list', title: 'Black list', type: 'link' },
			]
		},
		{
			title: 'Settings', icon: 'settings', type: 'sub', active: false, code: UserRoleObjectCode.Settings, children: [
				{ path: '/admin/common', title: 'Common', type: 'link' },
				{ path: '/admin/api-keys', title: 'API keys', type: 'link' },
				{ path: '/admin/currency-pairs', title: 'Currency pairs', type: 'link' },
				{ path: '/admin/faq', title: 'FAQ', type: 'link' },
			]
		}
	];


	// Array
	items = new BehaviorSubject<Menu[]>(this.MENUITEMS);
}
