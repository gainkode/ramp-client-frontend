import { MenuItem } from './common.model';

export const PersonalProfileMenuItems: Array<MenuItem> = [
	{
		id: 'home',
		name: 'Home',
		url: '/personal/main/home',
		icon: 'home',
		code: ''
	},
	{
		id: 'wallets',
		name: 'My Wallets',
		url: '/personal/main/wallets;balance=true',
		icon: 'account_balance_wallet',
		code: ''
	},
	{
		id: 'transactions',
		name: 'Transactions',
		url: '/personal/main/transactions',
		icon: 'history_edu',
		code: ''
	},
	{
		id: 'contactlist',
		name: 'Contact List',
		url: '/personal/main/contactlist',
		icon: 'group',
		code: 'CONTACTS'
	},
];

export const MerchantProfileMenuItems: Array<MenuItem> = [
	{
		id: 'home',
		name: 'Home',
		url: '/merchant/main/home',
		icon: 'home',
		code: ''
	},
	{
		id: 'wallets',
		name: 'My Wallets',
		url: '/merchant/main/wallets;balance=true',
		icon: 'account_balance_wallet',
		code: ''
	},
	{
		id: 'transactions',
		name: 'Transactions',
		url: '/merchant/main/transactions',
		icon: 'history_edu',
		code: ''
	},
	{
		id: 'contactlist',
		name: 'Contact List',
		url: '/merchant/main/contactlist',
		icon: 'group',
		code: 'CONTACTS'
	},
];

export const PersonalProfilePopupMenuItems: Array<MenuItem> = [
	{
		id: 'notifications',
		name: 'Notifications',
		url: '/personal/account/notifications',
		icon: 'notifications',
		code: ''
	},
	{
		id: 'settings',
		name: 'Settings',
		url: '/personal/account/settings/info',
		icon: 'construction',
		code: ''
	},
	{
		id: 'verification',
		name: 'Verification',
		url: '/personal/account/settings/verification',
		icon: 'person_outline',
		code: ''
	},
	{
		id: 'logout',
		name: 'Log out',
		url: '',
		icon: 'logout',
		code: ''
	}
];

export const MerchantProfilePopupMenuItems: Array<MenuItem> = [
	{
		id: 'notifications',
		name: 'Notifications',
		url: '/merchant/account/notifications',
		icon: 'notifications',
		code: ''
	},
	{
		id: 'settings',
		name: 'Settings',
		url: '/merchant/account/settings/info',
		icon: 'construction',
		code: ''
	},
	{
		id: 'verification',
		name: 'Verification',
		url: '/merchant/account/settings/verification',
		icon: 'person_outline',
		code: ''
	},
	{
		id: 'logout',
		name: 'Log out',
		url: '',
		icon: 'logout',
		code: ''
	}
];

export const ProfilePopupAdministrationMenuItem: MenuItem = {
	id: 'administration',
	name: 'Administration',
	url: '/admin/dashboard',
	icon: 'admin_panel_settings',
	code: ''
};
