import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, RouterStateSnapshot, Router } from '@angular/router';
import { UserType } from './model/generated-models';
import { AuthService } from './services/auth.service';

@Injectable()
export class AppGuard {
	constructor(private router: Router, private auth: AuthService) { }

	async canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Promise<boolean> {
		if (this.auth.isAuthenticatedUserType(UserType.Merchant)) {
			// If user type is Merchant we have to redirect him to /merchant router
			await this.router.navigateByUrl('/merchant/');
			return false;
		} else {
			// If user has personal type or user was not found we have to redirect user to /personal router
			await this.router.navigateByUrl('/personal/');
			return false;
		}
	}
}
