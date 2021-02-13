import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { Validators, FormBuilder } from '@angular/forms';

@Component({
    templateUrl: 'personal.component.html'
})
export class PersonalComponent {
    constructor(private auth: AuthService, private formBuilder: FormBuilder, private router: Router) { }
}
