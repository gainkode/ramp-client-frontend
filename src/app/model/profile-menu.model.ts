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
        url: '/personal/main/wallets;balance=true',
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
    // {
    //     id: 'pricelist',
    //     name: 'Crypto Pricelist',
    //     url: '/personal/main/pricelist',
    //     icon: 'insights'
    // }
];

export const MerchantProfileMenuItems: Array<MenuItem> = [
    {
        id: 'home',
        name: 'Home',
        url: '/merchant/main/home',
        icon: 'home'
    },
    {
        id: 'wallets',
        name: 'My Wallets',
        url: '/merchant/main/wallets;balance=true',
        icon: 'account_balance_wallet'
    },
    {
        id: 'transactions',
        name: 'Transactions',
        url: '/merchant/main/transactions',
        icon: 'history_edu'
    },
    {
        id: 'contactlist',
        name: 'Contact List',
        url: '/merchant/main/contactlist',
        icon: 'group'
    },
    // {
    //     id: 'pricelist',
    //     name: 'Crypto Pricelist',
    //     url: '/merchant/main/pricelist',
    //     icon: 'insights'
    // }
];

export const PersonalProfilePopupMenuItems: Array<MenuItem> = [
    {
        id: 'notifications',
        name: 'Notifications',
        url: '/personal/account/notifications',
        icon: 'notifications'
    },
    {
        id: 'settings',
        name: 'Settings',
        url: '/personal/account/settings',
        icon: 'construction'
    },
    {
        id: 'verification',
        name: 'Verification',
        url: '/personal/account/settings/verification',
        icon: 'person_outline'
    },
    {
        id: 'logout',
        name: 'Log out',
        url: '',
        icon: 'logout'
    }
];

export const MerchantProfilePopupMenuItems: Array<MenuItem> = [
    {
        id: 'notifications',
        name: 'Notifications',
        url: '/merchant/account/notifications',
        icon: 'notifications'
    },
    {
        id: 'settings',
        name: 'Settings',
        url: '/merchant/account/settings',
        icon: 'construction'
    },
    {
        id: 'verification',
        name: 'Verification',
        url: '/merchant/account/settings/verification',
        icon: 'person_outline'
    },
    {
        id: 'logout',
        name: 'Log out',
        url: '',
        icon: 'logout'
    }
];

export const ProfilePopupAdministrationMenuItem: MenuItem = {
    id: 'administration',
    name: 'Administration',
    url: '',
    icon: 'admin_panel_settings'
};
