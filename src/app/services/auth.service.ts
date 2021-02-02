import { Injectable } from "@angular/core";
import { Observable } from "rxjs";
//import { RestDataSource } from "./rest.datasource";

@Injectable()
export class AuthService {

    //constructor(private datasource: RestDataSource) { }
    constructor() { }

    authenticate(username: string, password: string): boolean {
        return true;
    }

    // authenticate(username: string, password: string): Observable<boolean> {
    //     return this.datasource.authenticate(username, password);
    // }

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
