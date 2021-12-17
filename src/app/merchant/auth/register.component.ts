import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { UserType } from 'src/app/model/generated-models';

@Component({
    templateUrl: 'register.component.html',
    styleUrls: ['../../../assets/auth.scss']
})
export class MerchantRegisterComponent {
    inProgress = false;
    errorMessage = '';
    USER_TYPE: typeof UserType = UserType;

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
