export interface AdminMenuItem {
    id: string;
    name: string;
    url: string;
    icon: string;
}

export const AdminMenuItems: Array<AdminMenuItem> = [
    {
        id: 'dashboard',
        name: 'Dashboard',
        url: '/admin/main/dashboard',
        icon: 'dashboard'
    },
    {
        id: 'transactions',
        name: 'Transactions',
        url: '/admin/main/transactions',
        icon: 'compare_arrows'
    },
    {
        id: 'customers',
        name: 'Customers',
        url: '/admin/main/customers',
        icon: 'shopping_bag'
    },
    {
        id: 'wallets',
        name: 'Wallets',
        url: '/admin/main/wallets',
        icon: 'wallet_membership'
    },
    {
        id: 'fees',
        name: 'Fees',
        url: '/admin/main/fees',
        icon: 'payment'
    },
    {
        id: 'notifications',
        name: 'Notifications',
        url: '/admin/main/notifications',
        icon: 'notifications'
    },
    {
        id: 'costs',
        name: 'Costs',
        url: '/admin/main/costs',
        icon: 'attach_money'
    },
    {
        id: 'identification',
        name: 'Identification',
        url: '/admin/main/identification',
        icon: 'assignment_ind'
    },
    {
        id: 'reconciliation',
        name: 'Reconciliation',
        url: '/admin/main/reconciliation',
        icon: 'cloud_off'
    },
    {
        id: 'system-users',
        name: 'System Users',
        url: '/admin/main/system-users',
        icon: 'account_box'
    },
    {
        id: 'risk-center',
        name: 'Resk Center',
        url: '/admin/main/risk-center',
        icon: 'bolt'
    },
    {
        id: 'affiliates',
        name: 'Affiliates',
        url: '/admin/main/affiliates',
        icon: 'device_hub'
    }
];
