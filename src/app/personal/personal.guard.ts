import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, RouterStateSnapshot, Router } from '@angular/router';
import { UserMode, UserType } from '../model/generated-models';
import { AuthService } from '../services/auth.service';
import { routes } from './personal-routing.module';

@Injectable()
export class PersonalGuard {
	constructor(private router: Router, private auth: AuthService) { }

	async canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Promise<boolean> {
		let isAuthentificatedUser = true;
		// If user mode is not internal we cant allow him to open his account
		if (!this.auth.isAuthenticatedUserMode(UserMode.InternalWallet)) {
			isAuthentificatedUser = false;
		}

		// If user mode is not Personal we cant allow him to open his account
		if (!this.auth.isAuthenticatedUserType(UserType.Personal)) {
			isAuthentificatedUser = false;
		}
		
		if (!isAuthentificatedUser) {
			// If the user has not passed any of the previous checks we have to check if he tries to open auth route or not
			if (route.data.authRoute) {
				return true;
			} else {
				await this.router.navigateByUrl('/');
				return false;
			}
		} else {
			// If user is authorized and tries to open auth route we have to redirect him to our main authentificated route
			if (route.data.authRoute) {
				const mainAuthentificatedRoute = routes.find(route => route?.data?.mainAuthentificatedRoute === true);
				await this.router.navigateByUrl(`/personal/${mainAuthentificatedRoute.path}`);
				return false;
			}
		}

		// If user hasn't passed his KYC we have to redirect every his authorized request to verification tab
		if (!this.auth.isPersonalApproved()) {
			const verificationUrl = '/personal/account/settings/verification';
			if (state.url !== verificationUrl) {
				void this.router.navigateByUrl(verificationUrl);
				return false;
			}
		}

		return true;
	}
}
