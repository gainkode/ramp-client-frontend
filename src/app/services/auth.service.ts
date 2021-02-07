import { Injectable } from "@angular/core";
import { Apollo, gql } from 'apollo-angular';

const LOGIN_POST = gql`
  mutation {
    login(
      recaptcha: "6LeIxAcTAAAAAJcZVRqyHh71UMIEGNQ_MXjiZKhI"    
      email: "xmax13@gmail.com"
      password: "!QAZ2wsx"
    ) {
      authToken    
      user {
        userId
        termsOfUse,
        email,
        name,
        birthday,
        created,
        userType,
        roles
      }
      authTokenAction
    }
  }
`;

@Injectable()
export class AuthService {

    constructor(private apollo: Apollo) { }

    authenticate(username: string, password: string): string {
        this.apollo.mutate({
            mutation: LOGIN_POST
            //mutation: LOGIN_POST,
            // variables: {
            //   postId: 12
            // }
          }).subscribe(({ data }) => {
            console.log('got data', data);
          },(error) => {
            console.log('there was an error sending the query', error);
          });
        return '';
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
