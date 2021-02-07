export class UserLogin {
    authToken: string = '';
    authTokenAction: string = '';
    user: User | null = null;
}

export class User {
    userId: string = '';
    userType: string = '';
    email: string = '';
    name: string = '';
    roles: string[] = [];
}