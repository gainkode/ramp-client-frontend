import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { Validators, FormBuilder } from '@angular/forms';

@Component({
    templateUrl: 'merchant.component.html'
})
export class MerchantComponent {
    constructor(private auth: AuthService, private formBuilder: FormBuilder, private router: Router) { }

    logout(): void {
        this.auth.logout();
    }
}
