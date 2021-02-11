import { Component } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Component({
    templateUrl: 'confirm-email.component.html',
    styleUrls: ['./login.component.scss']
})
export class ConfirmEmailComponent {
    token: string = '';
    validated: boolean = false;
    valid: boolean = false;

    constructor(private auth: AuthService, private router: Router, activeRoute: ActivatedRoute) {
        this.token = activeRoute.snapshot.params["token"];
        if (this.token!=undefined) {
            this.auth.confirmEmail(this.token)
                .subscribe(({ data }) => {
                    this.validated = true;
                    this.valid = true;
                },(error) => {
                    this.validated = true;
                });
        }
    }
}
