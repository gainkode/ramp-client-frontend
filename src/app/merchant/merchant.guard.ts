import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, RouterStateSnapshot, Router } from '@angular/router';
import { UserType } from '../model/generated-models';
import { AuthService } from '../services/auth.service';

@Injectable()
export class MerchantGuard {
    constructor(private router: Router, private auth: AuthService) { }

    canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {
        const authAction = this.auth.getAuthAction();
        const authValid = (authAction === '' || authAction === 'Default' || authAction === 'KycRequired');
        // if (!authValid) {
        //     return false;
        // }
        if (!this.auth.isAuthenticatedUserType(UserType.Merchant)) {
            this.router.navigateByUrl('/merchant/auth/login');
            return false;
        } else {
            // If merchant KYC is not approved, they must be redirected to the KYC page
            if (!this.auth.isMerchantApproved()) {
                if (route.url.length > 0) {
                    if (route.url[0].path !== 'kyc') {
                        this.router.navigateByUrl('/merchant/account/settings/verification');
                        return false;
                    }
                }
            }
        }
        return true;
    }
}
