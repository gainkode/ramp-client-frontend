export interface AdminMenuItem {
    id: string;
    name: string;
    url: string;
}

export const AdminMenuItems: Array<AdminMenuItem> = [
    {
        id: 'dashboard',
        name: 'Dashboard',
        url: '/admin/main/dashboard'
    },
    {
        id: 'transactions',
        name: 'Transactions',
        url: '/admin/main/transactions'
    },
    {
        id: 'customers',
        name: 'Customers',
        url: '/admin/main/customers'
    },
    {
        id: 'wallets',
        name: 'Wallets',
        url: '/admin/main/wallets'
    },
    {
        id: 'fees',
        name: 'Fees',
        url: '/admin/main/fees'
    },
    {
        id: 'notifications',
        name: 'Notifications',
        url: '/admin/main/notifications'
    },
    {
        id: 'costs',
        name: 'Costs',
        url: '/admin/main/costs'
    },
    {
        id: 'reconciliation',
        name: 'Reconciliation',
        url: '/admin/main/reconciliation'
    },
    {
        id: 'system-users',
        name: 'System Users',
        url: '/admin/main/system-users'
    },
    {
        id: 'risk-center',
        name: 'Resk Center',
        url: '/admin/main/risk-center'
    },
    {
        id: 'affiliates',
        name: 'Affiliates',
        url: '/admin/main/affiliates'
    }
];
