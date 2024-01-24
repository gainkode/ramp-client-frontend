import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, RouterStateSnapshot, Router, Route } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { NavService } from './services/nav.service';
import { routes } from './admin.routing.module';

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

		if (route.data.defaultRoute === true) {
			const path = `/admin/${this.findMainRouteWithAccess(routes)}`;
	
			if (state.url !== path) {
				//here override navigation from merchant menu, so initially it navigates to admin/dashboard
				setTimeout(() => void this.router.navigate([path]).then(), 0);
				return false;
			} else {
				return true;
			}
		}

		if (route.data.code) {
			const permission = this.auth.isPermittedObjectCode(route.data.code);
			// If no access get out from admin office
			if (permission === 0) {
				void this.router.navigateByUrl('/');
				return false;
			}
		}

		return true;
	}

	private findMainRouteWithAccess(routeItems: Route[]): string {
		let fullPath = '';
		
		for(const route of routeItems) {
			if (route?.data?.main === true) {
				const permission = this.auth.isPermittedObjectCode(route.data.code);

				if (permission !== 0) {
					fullPath = `${fullPath}/${route.path}`;
					break;
				}
			} else if (route.children?.length) {
				const childrenMainPath = this.findMainRouteWithAccess(route.children);
				if (childrenMainPath != '') {
					fullPath = `${route.path}${childrenMainPath}`;
				}
			}
		}

		return fullPath;
	}
}
