import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, RouterStateSnapshot, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { NavService } from './services/nav.service';

@Injectable()
export class AdminGuard {
  constructor(
    private router: Router,
    private auth: AuthService,
    public navServices: NavService) {
  }

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {
    if (!this.auth.isAuthenticatedUserRole(['MERCHANT', 'MANAGER', 'SUPPORT', 'ADMIN', 'DEMO'])) {
      this.router.navigateByUrl('/');
      return false;
    }
    const pathList: { path: string, code: string }[] = [];
    this.navServices.MENUITEMS.forEach(x => {
      if (x.children) {
        const groupCode = x.code;
        x.children.forEach(c => {
          if (c.path) {
            pathList.push({
              path: c.path,
              code: (groupCode && groupCode !== c.code) ? groupCode : c.code ?? ''
            });
          }
        })
      } else {
        if (x.path) {
          pathList.push({
            path: x.path,
            code: x.code ?? ''
          });
        }
      }
    });
    const currentItem = pathList.find(x => state.url.toLowerCase().includes(x.path.toLowerCase()));
    console.log(currentItem)
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
