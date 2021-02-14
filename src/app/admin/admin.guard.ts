import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, RouterStateSnapshot, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Injectable()
export class AdminGuard {
    constructor(private router: Router, private auth: AuthService) { }

    canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {
        //todo replace later with ADMIN role
        if (!this.auth.isAuthenticatedUserRole('USER')) {
            this.router.navigateByUrl('/auth/login');
            return false;
        }
        return true;
    }
}
