export class UserLogin {
    authToken: string = '';
    authTokenAction: string = '';
    user: User | null = null;
}

export class User {
    userId: string = '';
    userType: string = '';
    termsOfUse: boolean = false;
    email: string = '';
    name: string = '';
    birthday: string = '';
    created: string = '';
    roles: string[] = [];
}