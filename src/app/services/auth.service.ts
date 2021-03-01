import { Injectable } from '@angular/core';
import { Apollo, gql } from 'apollo-angular';
import { from, Observable } from 'rxjs';
import { SocialAuthService, FacebookLoginProvider, GoogleLoginProvider, SocialUser } from "angularx-social-login";
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

const REFRESH_TOKEN_POST = gql`
  mutation RefreshToken { refreshToken }
`;

const SOCIAL_LOGIN_POST = gql`
  mutation SocialLogin($recaptcha: String!, $oauthtoken: String!, $oauthprovider: OAuthProvider!) {
    login(
        recaptcha: $recaptcha,
        oAuthProvider: $oauthprovider,
        oAuthToken: $oauthtoken) {
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
    $countryCode2: String!, $countryCode3: String!, $phone: String!) {
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
        countryCode2: $countryCode2,
        countryCode3: $countryCode3,
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

const FORGOTPASSWORD_POST = gql`
  mutation ForgotPassword($email: String!, $recaptcha: String!) {
    forgotPassword(recaptcha: $recaptcha, email: $email)
  }
`;

const SETPASSWORD_POST = gql`
  mutation SetPassword($token: String!, $password: String!, $recaptcha: String!) {
    setPassword(recaptcha: $recaptcha, password: $password, token: $token)
  }
`;
  
const CONFIRMEMAIL_POST = gql`
  mutation ConfirmEmail($token: String!, $recaptcha: String!) {
    confirmEmail(recaptcha: $recaptcha, token: $token)
  }
`;

const CONFIRMNAME_POST = gql`
  mutation ConfirmName($token: String!, $recaptcha: String!, $name: String!, 
    $userType: UserType!, $mode: UserMode!, $firstName: String!, $lastName: String!,
    $countryCode2: String!, $countryCode3: String!, $phone: String!) {
    confirmName(
        recaptcha: $recaptcha,
        token: $token,
        name: $name,
        type: $userType,
        mode: $mode,
        firstName: $firstName,
        lastName: $lastName,
        countryCode2: $countryCode2,
        countryCode3: $countryCode3,
        phone: $phone
    ) {
      authToken
      user {
        userId,
        email,
        name,
        type,
        roles
      }
      authTokenAction
    }
  }
`;

@Injectable()
export class AuthService {
    constructor(private apollo: Apollo, private socialAuth: SocialAuthService) { }

    refreshToken(): Observable<any> {
        sessionStorage.setItem('refreshTokenError', '');
        const result = this.apollo.mutate({
            mutation: REFRESH_TOKEN_POST
        });
        result.subscribe(x => {
            const d = x.data as any;
            sessionStorage.setItem('currentToken', d.refreshToken as string);
        }, error => {
            sessionStorage.setItem('refreshTokenError', 'error');
        })
        return result;
    }

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

    authenticateSocial(provider: string, token: string): Observable<any> {
        return this.apollo.mutate({
            mutation: SOCIAL_LOGIN_POST,
            variables: {
                recaptcha: environment.recaptchaId,
                oauthprovider: provider,
                oauthtoken: token
            }
        });
    }

    socialSignIn(provider: string): Observable<any> {
        let providerId = '';
        if (provider.toLowerCase() === 'google') {
            providerId = GoogleLoginProvider.PROVIDER_ID;
        } else if (provider.toLowerCase() === 'facebook') {
            providerId = FacebookLoginProvider.PROVIDER_ID;
        }
        return from(
            this.socialAuth.signIn(providerId)
            .then(function(data) {
                return { user: data, error: undefined };
            }).catch(function(data) {
                return { user: undefined, error: data };
            })
        );
    }

    register(username: string, usermail: string, userpassword: string, usertype: string,
        firstname: string, lastname: string, countrycode2: string, countrycode3: string,
        phoneNumber: string): Observable<any> {
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
                countryCode2: countrycode2,
                countryCode3: countrycode3,
                phone: phoneNumber
            }
        });
    }

    confirmName(tokenId: string, username: string, usertype: string, firstname: string, lastname: string, 
        countrycode2: string, countrycode3: string, phoneNumber: string): Observable<any> {
        return this.apollo.mutate({
            mutation: CONFIRMNAME_POST,
            variables: {
                token: tokenId,
                recaptcha: environment.recaptchaId,
                name: username,
                userType: usertype,
                mode: 'ExternalWallet',
                firstName: firstname,
                lastName: lastname,
                countryCode2: countrycode2,
                countryCode3: countrycode3,
                phone: phoneNumber
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

    setPassword(usertoken: string, userpassword: string): Observable<any> {
        return this.apollo.mutate({
            mutation: SETPASSWORD_POST,
            variables: {
                recaptcha: environment.recaptchaId,
                token: usertoken,
                password: userpassword
            }
        });
    }

    confirmEmail(tokenValue: string): Observable<any> {
        return this.apollo.mutate({
            mutation: CONFIRMEMAIL_POST,
            variables: {
                recaptcha: environment.recaptchaId,
                token: tokenValue
            }
        });
    }

    setLoginUser(login: LoginResult): void {
        console.log(login);
        sessionStorage.setItem('currentUser', JSON.stringify(login.user));
        sessionStorage.setItem('currentToken', login.authToken as string);
    }

    get authenticated(): boolean {
        return this.token !== '';
    }

    private getAuthenticatedUser(): User | null {
        let result: User | null = null;
        const userData: string | null = sessionStorage.getItem('currentUser');
        if (userData !== null) {
            result = JSON.parse(userData as string) as User;
        }
        return result;
    }

    isAuthenticatedUserType(type: string): boolean {
        let result = false;
        const user: User | null = this.getAuthenticatedUser();
        if (user !== null) {
            result = (user.type === type);
        }
        return result;
    }

    isAuthenticatedUserRole(role: string): boolean {
        let result = false;
        const user: User | null = this.getAuthenticatedUser();
        if (user != null) {
            const roleItem = (user.roles?.find(x => x.toLowerCase() == role));
            if (roleItem !== undefined) {
                result = true;
            }
        }
        return result;
    }

    get token(): string {
        const tokenData: string | null = sessionStorage.getItem('currentToken');
        return (tokenData === null) ? '' : tokenData;
    }

    socialSignOut(): void {
        this.socialAuth.signOut().then(function(data) {
            //console.log(data);
        }).catch(function(error) {
            console.log(error);
        });
    }

    logout(): void {
        this.apollo.client.resetStore();
        sessionStorage.removeItem('currentUser');
        sessionStorage.removeItem('currentToken');
    }
}
