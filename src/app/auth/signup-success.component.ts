import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
    templateUrl: 'signup-success.component.html',
    styleUrls: ['./login.component.scss']
})
export class SignupSuccessComponent {
    constructor(private router: Router) { }   
}
