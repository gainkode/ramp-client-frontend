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
        termsOfUse
        email
        name
        birthday
        created
        userType
        roles
      }
      authTokenAction
    }
  }
`;

@Injectable()
export class AuthService {
    private error: string = '';

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
        sessionStorage.setItem("currentUser", JSON.stringify(login));
        sessionStorage.setItem("currentToken", login.authToken);
    }

    get authenticated(): boolean {
        return this.token != "";
    }

    get token(): string {
        let userData: string | null = localStorage.getItem('currentUser');
        if (userData !== null) {
            if (userData !== "") {
                let user = JSON.parse(userData);
                return (user.token === null) ? "" : user.token;
            }
        }
        return "";
    }

    logout() {
        // remove user from local storage to log user out
        localStorage.removeItem('currentUser');
    }
}
