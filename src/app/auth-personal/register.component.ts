import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
    templateUrl: 'register.component.html',
    styleUrls: ['./login.component.scss']
})
export class RegisterComponent {
    inProgress = false;
    errorMessage = '';

    constructor(private router: Router) { }

    onError(error: string): void {
        this.errorMessage = error;
    }

    onProgressChange(visible: boolean): void {
        this.inProgress = visible;
    }

    onRegistered(email: string): void {
        this.router.navigateByUrl('/auth/personal/success/signup');
    }
}
