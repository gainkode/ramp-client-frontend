import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, RouterStateSnapshot, Router } from '@angular/router';
import { AdminMenuItems } from '../admin_old/model/menu.model';
import { AuthService } from '../services/auth.service';

@Injectable()
export class AdminNewGuard {
  constructor(private router: Router, private auth: AuthService) {
  }

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {
    if (!this.auth.isAuthenticatedUserRole(['MERCHANT', 'MANAGER', 'SUPPORT', 'ADMIN'])) {
      this.router.navigateByUrl('/');
      return false;
    }

    const currentItem = AdminMenuItems.find(x => state.url.toLowerCase().includes(x.url.toLowerCase()));
    if (currentItem) {
      const permission = this.auth.isPermittedObjectCode(currentItem.code);
      if (permission === 0) {
        this.router.navigateByUrl('/admin/dashboard');
        return false;
      }
    }

    return true;
  }
}
