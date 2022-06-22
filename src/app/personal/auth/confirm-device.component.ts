import { Component, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { AuthService } from 'src/app/services/auth.service';
import { EnvService } from 'src/app/services/env.service';
import { ErrorService } from 'src/app/services/error.service';

@Component({
    templateUrl: 'confirm-device.component.html',
    styleUrls: ['../../../assets/auth.scss']
})
export class PersonalConfirmDeviceComponent implements OnDestroy {
    token = '';
    validated = false;
    valid = false;
    errorMessage = '';
    logoSrc = `${EnvService.image_host}/images/logo-color.png`;
    logoAlt = EnvService.product;

    private subscriptions: Subscription = new Subscription();

    constructor(
        private auth: AuthService,
        private errorHandler: ErrorService,
        public router: Router,
        public activeRoute: ActivatedRoute) {
        this.token = activeRoute.snapshot.params['token'];
        if (this.token !== undefined) {
            this.subscriptions.add(
                this.auth.confirmDevice(this.token).subscribe(({ data }) => {
                    this.validated = true;
                    this.valid = true;
                }, (error) => {
                    this.validated = true;
                    this.errorMessage = this.errorHandler.getError(error.message, 'Unable to validate device');
                })
            );
        }
    }

    ngOnDestroy(): void {
        this.subscriptions.unsubscribe();
    }
}
