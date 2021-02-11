import { Component } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';

@Component({
    templateUrl: 'success.component.html',
    styleUrls: ['./login.component.scss']
})
export class SuccessComponent {
    successType: string = '';
    pageTitle: string = '';

    constructor(private router: Router, activeRoute: ActivatedRoute) {
        this.successType = activeRoute.snapshot.params["type"];
        if (this.successType != 'signup' && this.successType != 'restore') {
            this.router.navigateByUrl("/auth/login");
        }
    }
}
