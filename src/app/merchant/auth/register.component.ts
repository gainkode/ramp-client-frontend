import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { UserType } from 'src/app/model/generated-models';
import { EnvService } from 'src/app/services/env.service';

@Component({
    templateUrl: 'register.component.html',
    styleUrls: ['../../../assets/auth.scss']
})
export class MerchantRegisterComponent {
    inProgress = false;
    errorMessage = '';
    USER_TYPE: typeof UserType = UserType;
    logoSrc = `${EnvService.image_host}/images/logo-widget.png`;
    logoAlt = EnvService.product;

    constructor(public router: Router) { }

    onError(error: string): void {
        this.errorMessage = error;
    }

    onProgressChange(visible: boolean): void {
        this.inProgress = visible;
    }

    onRegistered(email: string): void {
        this.router.navigateByUrl('/merchant/auth/success/signup');
    }
}
