import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Component({
    templateUrl: 'fees.component.html'
})
export class FeesComponent {
    constructor(private auth: AuthService, private router: Router) { }
}
