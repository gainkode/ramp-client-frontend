import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { UserType } from '../model/generated-models';

@Component({
    templateUrl: 'register.component.html',
    styleUrls: ['./login.component.scss']
})
export class RegisterComponent {
    inProgress = false;
    errorMessage = '';
    userType = UserType.Merchant;

    constructor(private router: Router) { }

    onError(error: string): void {
        this.errorMessage = error;
    }

    onProgressChange(visible: boolean): void {
        this.inProgress = visible;
    }

    onRegistered(email: string): void {
        this.router.navigateByUrl('/auth/merchant/success/signup');
    }
}
