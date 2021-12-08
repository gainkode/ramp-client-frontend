import { MenuItem } from '../../model/common.model';

export const AdminMenuItems: Array<MenuItem> = [
    {
        id: 'dashboard',
        name: 'Dashboard',
        url: '/admin/dashboard',
        icon: 'dashboard'
    },
    {
        id: 'transactions',
        name: 'Transactions',
        url: '/admin/transactions',
        icon: 'compare_arrows'
    },
    {
        id: 'customers',
        name: 'Customers',
        url: '/admin/customers',
        icon: 'shopping_bag'
    },
    {
        id: 'wallets',
        name: 'Wallets',
        url: '/admin/wallets',
        icon: 'wallet_membership'
    },
    {
        id: 'fees',
        name: 'Fees',
        url: '/admin/fees',
        icon: 'payment'
    },
    {
        id: 'notifications',
        name: 'Notifications',
        url: '/admin/notifications',
        icon: 'notifications'
    },
    {
        id: 'costs',
        name: 'Costs',
        url: '/admin/costs',
        icon: 'attach_money'
    },
    {
        id: 'kyckyb',
        name: 'KYC / KYB',
        url: '/admin/identification',
        icon: 'assignment_ind'
    },
    {
        id: 'reconciliation',
        name: 'Reconciliation',
        url: '/admin/reconciliation',
        icon: 'cloud_off'
    },
    {
        id: 'system-users',
        name: 'System Users',
        url: '/admin/system-users',
        icon: 'account_box'
    },
    {
        id: 'risk-center',
        name: 'Risk Center',
        url: '/admin/risk-center',
        icon: 'bolt'
    },
    {
        id: 'widgets',
        name: 'Widgets',
        url: '/admin/widgets',
        icon: 'device_hub'
    },
    {
        id: 'settings',
        name: 'Settings',
        url: '/admin/settings',
        icon: 'settings'
    }
];
