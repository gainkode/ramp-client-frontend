import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, RouterStateSnapshot, Router } from '@angular/router';
import { UserType } from '../model/generated-models';
import { AuthService } from '../services/auth.service';

@Injectable()
export class PersonalGuard {
    constructor(private router: Router, private auth: AuthService) { }

    canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {
        //const authAction = this.auth.getAuthAction();
        //const authValid = (authAction === '' || authAction === 'Default' || authAction === 'KycRequired');
        //if (!this.auth.isAuthenticatedUserType('Personal') || !authValid) {
        if (!this.auth.isAuthenticatedUserType(UserType.Personal)) {
            this.router.navigateByUrl('/personal/auth/login');
            return false;
        }
        return true;
    }
}
