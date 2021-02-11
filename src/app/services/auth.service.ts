import { Injectable } from "@angular/core";
import { Apollo, gql } from 'apollo-angular';
import { Observable } from 'rxjs';
import { UserLogin } from '../model/user.model';
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
  mutation Signup($recaptcha: String!, $name: String!, $email: String!, $password: String!, $userType: UserType!) {
    signup(
        recaptcha: $recaptcha, 
        email: $email,
        password: $password,
        name: $name,
        type: $userType,
        termsOfUse: true
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
        })
    }

    register(username: string, usermail: string, userpassword: string, usertype: string): Observable<any> {
        return this.apollo.mutate({
            mutation: SIGNUP_POST,
            variables: {
                recaptcha: environment.recaptchaId,
                name: username,
                email: usermail,
                password: userpassword,
                userType: usertype
            }
        })
    }

    setLoginUser(login: UserLogin) {
        sessionStorage.setItem("currentUser", JSON.stringify(login.user));
        sessionStorage.setItem("currentToken", login.authToken);
    }

    get authenticated(): boolean {
        return this.token != "";
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
