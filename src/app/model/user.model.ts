export class UserLogin {
    authToken: string = '';
    authTokenAction: string = '';
    user: User | null = null;
}

export class User {
    userId: string = '';
    email: string = '';
    name: string = '';
    roles: string[] = [];
}