import { MenuItem } from './common.model';

export const PersonalProfileMenuItems: Array<MenuItem> = [
    {
        id: 'home',
        name: 'Home',
        url: '/personal/main/home',
        icon: 'home'
    },
    {
        id: 'myaccount',
        name: 'My Account',
        url: '/personal/main/myaccount',
        icon: 'account_circle'
    },
    {
        id: 'mycontacts',
        name: 'My Contacts',
        url: '/personal/main/mycontacts',
        icon: 'contacts'
    },
    {
        id: 'transactions',
        name: 'Transactions',
        url: '/personal/main/transactions',
        icon: 'compare_arrows'
    },
    {
        id: 'exchanger',
        name: 'Exchanger',
        url: '/personal/main/exchanger',
        icon: 'forward_10'
    }
];

export const PersonalProfilePopupMenuItems: Array<MenuItem> = [
    {
        id: 'notifications',
        name: 'Notifications',
        url: '',
        icon: 'home'
    },
    {
        id: 'settings',
        name: 'Settings',
        url: '',
        icon: ''
    },
    {
        id: 'verification',
        name: 'Verification',
        url: '',
        icon: ''
    },
    {
        id: 'logout',
        name: 'Log out',
        url: '',
        icon: ''
    }
];
