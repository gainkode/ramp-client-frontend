import { Component } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { ErrorService } from '../services/error.service';

@Component({
    templateUrl: 'confirm-device.component.html',
    styleUrls: ['./login.component.scss']
})
export class ConfirmDeviceComponent {
    token = '';
    validated = false;
    valid = false;
    errorMessage = '';

    constructor(private auth: AuthService, private errorHandler: ErrorService,
        private router: Router, activeRoute: ActivatedRoute) {
        this.token = activeRoute.snapshot.params['token'];
        if (this.token !== undefined) {
            this.auth.confirmDevice(this.token).subscribe(({ data }) => {
                this.validated = true;
                this.valid = true;
            }, (error) => {
                this.validated = true;
                this.errorMessage = this.errorHandler.getError(
                    error.message,
                    'Unable to validate device');
            });
        }
    }
}
