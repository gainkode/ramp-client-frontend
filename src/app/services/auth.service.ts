import { Injectable } from "@angular/core";
import { Apollo, gql } from 'apollo-angular';
import { Observable } from 'rxjs';
import { LoginResult, User } from '../model/generated-models';
import { environment } from 'src/environments/environment';

const LOGIN_POST = gql`
  mutation Login($recaptcha: String!, $email: String!, $password: String!) {
    login(
        recaptcha: $recaptcha, 
        email: $email, 
        password: $password) {
            authToken
            user {
                userId
                email
                name
                roles
                type
            }
            authTokenAction
        }
    }
`;

const SIGNUP_POST = gql`
  mutation Signup($recaptcha: String!, $name: String!, $email: String!, $password: String!, $userType: UserType!,
    $mode: UserMode!, $termsOfUse: Boolean!, $firstName: String!, $lastName: String!,
    $countryCode: String!, $phone: String!) {
    signup(
        recaptcha: $recaptcha, 
        email: $email,
        password: $password,
        name: $name,
        type: $userType,
        mode: $mode,
        termsOfUse: $termsOfUse,
        firstName: $firstName,
        lastName: $lastName,
        countryCode: $countryCode,
        phone: $phone
    ) {
      authToken    
      user {
        userId,
        email,
        name
      }
      authTokenAction
    }
  }
`;

// merchantId?: Maybe<Scalars['String']>;
// birthday?: Maybe<Scalars['DateTime']>;

const FORGOTPASSWORD_POST = gql`
  mutation ForgotPassword($email: String!, $recaptcha: String!) {
    forgotPassword(recaptcha: $recaptcha, email: $email)
  }
`;

const CONFIRMEMAIL_POST = gql`
  mutation ConfirmEmail($token: String!, $recaptcha: String!) {
    confirmEmail(recaptcha: $recaptcha, token: $token)
  }
`;

@Injectable()
export class AuthService {
    constructor(private apollo: Apollo) { }

    authenticate(username: string, userpassword: string): Observable<any> {
        return this.apollo.mutate({
            mutation: LOGIN_POST,
            variables: {
                recaptcha: environment.recaptchaId,
                email: username,
                password: userpassword
            }
        });
    }

    register(username: string, usermail: string, userpassword: string, usertype: string,
        firstname: string, lastname: string, countrycode: string, phone: string): Observable<any> {
        return this.apollo.mutate({
            mutation: SIGNUP_POST,
            variables: {
                recaptcha: environment.recaptchaId,
                name: username,
                email: usermail,
                password: userpassword,
                userType: usertype,
                mode: 'ExternalWallet',
                termsOfUse: true,
                firstName: firstname,
                lastName: lastname,
                countryCode: countrycode,
                phone: phone,
                oAuthToken: '',
                oAuthProvider: ''
            }
        });
    }

    forgotPassword(usermail: string): Observable<any> {
        return this.apollo.mutate({
            mutation: FORGOTPASSWORD_POST,
            variables: {
                recaptcha: environment.recaptchaId,
                email: usermail
            }
        });
    }

    confirmEmail(token: string): Observable<any> {
        return this.apollo.mutate({
            mutation: CONFIRMEMAIL_POST,
            variables: {
                recaptcha: environment.recaptchaId,
                token: token
            }
        });
    }

    setLoginUser(login: LoginResult) {
        console.log(login.user);
        sessionStorage.setItem("currentUser", JSON.stringify(login.user));
        sessionStorage.setItem("currentToken", login.authToken as string);
    }

    get authenticated(): boolean {
        return this.token != "";
    }

    private getAuthenticatedUser(): User | null {
        let result: User | null = null;
        let userData: string | null = sessionStorage.getItem('currentUser');
        if (userData != null) {
            result = JSON.parse(userData as string) as User;
        }
        return result;
    }

    isAuthenticatedUserType(type: string): boolean {
        let result: boolean = false;
        let user: User | null = this.getAuthenticatedUser();
        if (user != null) {
            result = (user.type == type);
        }
        return result;
    }

    get token(): string {
        let tokenData: string | null = sessionStorage.getItem('currentToken');
        return (tokenData === null) ? "" : tokenData;
    }

    logout() {
        sessionStorage.removeItem("currentUser");
        sessionStorage.removeItem("currentToken");
    }
}
