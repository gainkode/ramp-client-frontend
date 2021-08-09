import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, RouterStateSnapshot, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Injectable()
export class PersonalGuard {
    constructor(private router: Router, private auth: AuthService) { }

    canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {
        const authAction = this.auth.getAuthAction();
        const authValid = (authAction === '' || authAction === 'Default' || authAction === 'KycRequired');
        if (!this.auth.isAuthenticatedUserType('Personal') || !authValid) {
            this.router.navigateByUrl('/auth/login/personal');
            return false;
        }
        return true;
    }
}
