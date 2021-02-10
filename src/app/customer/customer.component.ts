import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { Validators, FormBuilder } from '@angular/forms';

@Component({
    templateUrl: 'customer.component.html'
})
export class CustomerComponent {
    constructor(private auth: AuthService, private formBuilder: FormBuilder, private router: Router) { }
}
