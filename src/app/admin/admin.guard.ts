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

	async canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Promise<boolean> {
		if (!this.auth.isAuthenticatedUserRole(availableUserRoles)) {
			void this.router.navigateByUrl('/');
			return false;
		}

		if (route.data.defaultRoute === true) {
			// If user opened default route we have to find first main route with access for this user
			const mainRoutPath = this.findMainRouteWithAccess(routes);
			let path = '';

			// If user no access to any our main routes(or we don't have any main routes but we have default route) we have to redirect him to base route
			if (mainRoutPath) {
				path = `/admin/${mainRoutPath}`;
			} else {
				await this.router.navigateByUrl('/');
				return false;
			}
	
			if (state.url !== path) {
				//here override navigation from merchant menu, so initially it navigates to admin/dashboard
				await this.router.navigate([path]);
				return false;
			} else {
				return true;
			}
		}

		if (route.data.code) {
			const permission = this.auth.isPermittedObjectCode(route.data.code);
			// If no access get out from admin office
			if (permission === 0) {
				await this.router.navigateByUrl('/');
				return false;
			}
		}

		return true;
	}

	private findMainRouteWithAccess(routeItems: Route[]): string {
		let fullPath = '';
		for(const route of routeItems) {
			// If this route is main we have to check if user has permission to open this route
			if (route?.data?.main === true) {
				const permission = this.auth.isPermittedObjectCode(route.data.code);

				if (permission !== 0) {
					fullPath = `${fullPath}/${route.path}`;
					break;
				}
			} else if (route.children?.length) {
				// if this is not main route but this route has children we have to check if some child route is main route
				const childrenMainPath = this.findMainRouteWithAccess(route.children);
				if (childrenMainPath != '') {
					fullPath = `${route.path}${childrenMainPath}`;
					break;
				}
			}
		}

		return fullPath;
	}
}
