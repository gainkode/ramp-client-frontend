import { Component } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';

@Component({
    templateUrl: 'success.component.html',
    styleUrls: ['../../../assets/auth.scss']
})
export class PersonalSuccessComponent {
    successType = '';

    constructor(public router: Router, public activeRoute: ActivatedRoute) {
        this.successType = activeRoute.snapshot.params['type'];
        if (this.successType !== 'signup' &&
            this.successType !== 'reset' &&
            this.successType !== 'restore') {
            this.router.navigateByUrl('/personal/auth/login');
        }
    }
}
