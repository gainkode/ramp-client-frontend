import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Component({
    templateUrl: 'fee-scheme.component.html'
})
export class FeeSchemeComponent {
    constructor(private auth: AuthService, private router: Router) { }
}
