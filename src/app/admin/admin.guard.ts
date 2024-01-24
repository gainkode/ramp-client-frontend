import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, RouterStateSnapshot, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { NavService } from './services/nav.service';

export const availableUserRoles = ['MERCHANT', 'MANAGER', 'SUPPORT', 'ADMIN', 'DEMO'];
@Injectable()
export class AdminGuard {
	constructor(
		private router: Router,
		private auth: AuthService,
		public navServices: NavService) {
	}

	canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {
		if (!this.auth.isAuthenticatedUserRole(availableUserRoles)) {
			void this.router.navigateByUrl('/');
			return false;
		}
		
		const permission = this.auth.isPermittedObjectCode(route.data.code);
		// If no access get out from admin office
		if (permission === 0) {
			void this.router.navigateByUrl('/');
			return false;
		}

		return true;
	}
}
