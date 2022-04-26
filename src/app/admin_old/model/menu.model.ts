import { MenuItem } from '../../model/common.model';

export const AdminMenuItems: Array<MenuItem> = [
    {
        id: 'dashboard',
        name: 'Dashboard',
        url: '/admin/dashboard',
        icon: 'dashboard',
        code: 'TRANSACTIONS'
    },
    {
        id: 'transactions',
        name: 'Transactions',
        url: '/admin/transactions',
        icon: 'compare_arrows',
        code: 'TRANSACTIONS'
    },
    {
        id: 'customers',
        name: 'Customers',
        url: '/admin/customers',
        icon: 'shopping_bag',
        code: 'CUSTOMERS'
    },
    {
        id: 'wallets',
        name: 'Wallets',
        url: '/admin/wallets',
        icon: 'wallet_membership',
        code: 'WALLETS'
    },
    {
        id: 'fees',
        name: 'Fees',
        url: '/admin/fees',
        icon: 'payment',
        code: 'FEES'
    },
    {
        id: 'notifications',
        name: 'Notifications',
        url: '/admin/notifications',
        icon: 'notifications',
        code: 'NOTIFICATIONS'
    },
    {
        id: 'costs',
        name: 'Costs',
        url: '/admin/costs',
        icon: 'attach_money',
        code: 'COSTS'
    },
    {
        id: 'kyckyb',
        name: 'KYC / KYB',
        url: '/admin/identification',
        icon: 'assignment_ind',
        code: 'KYC'
    },
    {
        id: 'reconciliation',
        name: 'Reconciliation',
        url: '/admin/reconciliation',
        icon: 'cloud_off',
        code: 'RECONCILIATION'
    },
    {
        id: 'system-users',
        name: 'System Users',
        url: '/admin/system-users',
        icon: 'account_box',
        code: 'SYSTEM_USERS'
    },
    {
        id: 'risk-center',
        name: 'Risk Center',
        url: '/admin/risk-center',
        icon: 'bolt',
        code: 'RISKS'
    },
    {
        id: 'widgets',
        name: 'Widgets',
        url: '/admin/widgets',
        icon: 'device_hub',
        code: 'AFFILIATES'
    },
    {
        id: 'settings',
        name: 'Settings',
        url: '/admin/settings',
        icon: 'settings',
        code: 'SETTINGS'
    }
];
