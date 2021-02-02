import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Component({
    templateUrl: 'login.component.html'
})

export class LoginComponent {
    constructor(private auth: AuthService, private router: Router) { }
    
    isAuthenticated(): boolean {
        return this.auth.authenticated;
    }    
}
