import { Component } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';

@Component({
    templateUrl: 'confirm-email.component.html',
    styleUrls: ['./login.component.scss']
})
export class ConfirmEmailComponent {
    token: string = '';
    validated: boolean = false;
    valid: boolean = false;

    constructor(private router: Router, activeRoute: ActivatedRoute) {
        this.token = activeRoute.snapshot.params["token"];
        setTimeout(p => {
            this.validated = true;
            if (this.token == 'valid') {
                this.valid = true;
            }
        }, 2000);
    }
}
