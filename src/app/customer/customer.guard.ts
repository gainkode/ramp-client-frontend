import { Injectable } from "@angular/core";
import { ActivatedRouteSnapshot, RouterStateSnapshot, Router } from "@angular/router";
import { AuthService } from "../services/auth.service";

@Injectable()
export class CustomerGuard {
    constructor(private router: Router, private auth: AuthService) { }

    canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {
        if (!this.auth.isAuthenticatedUserType('Customer')) {
            this.router.navigateByUrl("/auth/login");
            return false;
        }
        return true;
    }
}