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
        id: 'fee-scheme',
        name: 'Fee scheme',
        url: '/admin/main/fee-scheme'
    },
    {
        id: 'notifications',
        name: 'Notifications',
        url: '/admin/main/notifications'
    }
];
