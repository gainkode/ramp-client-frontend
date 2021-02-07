import { Injectable } from "@angular/core";
import { Apollo, gql } from 'apollo-angular';
import { Observable } from 'rxjs';
import { UserLogin } from '../model/user.model';

const recaptchaId = '6LeIxAcTAAAAAJcZVRqyHh71UMIEGNQ_MXjiZKhI';
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
        userType
        roles
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
                recaptcha: recaptchaId,
                email: username,
                password: userpassword
            }
        })
    }

    setLoginUser(login: UserLogin) {
        sessionStorage.setItem("currentUser", JSON.stringify(login.user));
        sessionStorage.setItem("currentToken", login.authToken);
        sessionStorage.removeItem("loginErrorCounter");
    }

    registerLoginError(): boolean {
        let counter = sessionStorage.getItem("loginErrorCounter");
        let counterInt = 0;
        if (counter != null) {
            counterInt = Number(counter) || 0;
            if (counterInt > 4) {
                return false;
            }
        }
        counterInt++;
        sessionStorage.setItem("loginErrorCounter", counterInt.toString());
        return true;
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
