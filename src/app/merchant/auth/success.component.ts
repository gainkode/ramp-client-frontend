import { Component } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { EnvService } from 'src/app/services/env.service';

@Component({
    templateUrl: 'success.component.html',
    styleUrls: ['../../../assets/auth.scss']
})
export class MerchantSuccessComponent {
    successType = '';
    logoSrc = `${EnvService.image_host}/images/logo-color.png`;
    logoAlt = EnvService.product;

    constructor(public router: Router, activeRoute: ActivatedRoute) {
        this.successType = activeRoute.snapshot.params['type'];
        if (this.successType !== 'signup' &&
            this.successType !== 'reset' &&
            this.successType !== 'restore') {
            this.router.navigateByUrl('/merchant/auth/login');
        }
    }
}
