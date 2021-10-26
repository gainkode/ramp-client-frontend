import { MenuItem } from './common.model';

export const PersonalProfileMenuItems: Array<MenuItem> = [
    {
        id: 'home',
        name: 'Home',
        url: '/personal/main/home',
        icon: 'home'
    },
    {
        id: 'wallets',
        name: 'My Wallets',
        url: '/personal/main/wallets',
        icon: 'account_balance_wallet'
    },
    {
        id: 'transactions',
        name: 'Transactions',
        url: '/personal/main/transactions',
        icon: 'history_edu'
    },
    {
        id: 'contactlist',
        name: 'Contact List',
        url: '/personal/main/contactlist',
        icon: 'group'
    },
    
    {
        id: 'pricelist',
        name: 'Crypto Pricelist',
        url: '/personal/main/pricelist',
        icon: 'insights'
    }
];

export const PersonalProfilePopupMenuItems: Array<MenuItem> = [
    {
        id: 'notifications',
        name: 'Notifications',
        url: '',
        icon: 'notifications'
    },
    {
        id: 'settings',
        name: 'Settings',
        url: '',
        icon: 'construction'
    },
    {
        id: 'verification',
        name: 'Verification',
        url: '',
        icon: 'person_outline'
    },
    {
        id: 'logout',
        name: 'Log out',
        url: '',
        icon: 'logout'
    }
];

export const PersonalProfilePopupAdministrationMenuItem: MenuItem = {
    id: 'administration',
    name: 'Administration',
    url: '',
    icon: 'admin_panel_settings'
};
