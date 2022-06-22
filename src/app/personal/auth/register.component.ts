import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { EnvService } from 'src/app/services/env.service';

@Component({
    templateUrl: 'register.component.html',
    styleUrls: ['../../../assets/auth.scss']
})
export class PersonalRegisterComponent {
    inProgress = false;
    errorMessage = '';
    logoSrc = `${EnvService.image_host}/images/logo-color.png`;
    logoAlt = EnvService.product;

    constructor(public router: Router) { }

    onError(error: string): void {
        this.errorMessage = error;
    }

    onProgressChange(visible: boolean): void {
        this.inProgress = visible;
    }

    onRegistered(email: string): void {
        this.router.navigateByUrl('/personal/auth/success/signup');
    }
}
