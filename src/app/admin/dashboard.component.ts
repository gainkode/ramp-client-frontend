import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Component({
    templateUrl: 'dashboard.component.html'
})
export class DashboardComponent {
    constructor(private auth: AuthService, private router: Router) { }
}
