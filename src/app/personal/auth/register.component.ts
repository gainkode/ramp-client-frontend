import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
    templateUrl: 'register.component.html',
    styleUrls: ['../../../assets/auth.scss']
})
export class PersonalRegisterComponent {
    inProgress = false;
    errorMessage = '';

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
