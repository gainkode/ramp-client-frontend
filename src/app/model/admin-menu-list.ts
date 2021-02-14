export interface AdminMenuItem {
    name: string;
    url: string;
}

export const AdminMenuItems: Array<AdminMenuItem> = [
    {
        name: 'Dashboard',
        url: '/admin/dashboard'
    },
    {
        name: 'Transactions',
        url: '/admin/transactions'
    },
    {
        name: 'Customers',
        url: '/admin/customers'
    },
    {
        name: 'Wallets',
        url: '/admin/wallets'
    },
    {
        name: 'Fee scheme',
        url: '/admin/fee-scheme'
    },
    {
        name: 'Notifications',
        url: '/admin/notifications'
    }
];
