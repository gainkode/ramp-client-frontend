import { AfterViewInit, Component, OnDestroy, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { Subscription } from 'rxjs';
import { AuthService } from 'services/auth.service';
import { EnvService } from 'services/env.service';
import { ErrorService } from 'services/error.service';

@Component({
    templateUrl: 'confirm-email.component.html',
    styleUrls: ['../../../assets/auth.scss']
})
export class MerchantConfirmEmailComponent implements OnDestroy, AfterViewInit {
    token = '';
    validated = false;
    valid = false;
    errorMessage = '';
    logoSrc = `${EnvService.image_host}/images/logo-color.png`;
    logoAlt = EnvService.product;
    @ViewChild('recaptcha') private recaptchaModalContent; 

    private subscriptions: Subscription = new Subscription();
    private recaptchaDialog: NgbModalRef | undefined = undefined;

    constructor(
        private modalService: NgbModal,
        private auth: AuthService,
        private errorHandler: ErrorService,
        public activeRoute: ActivatedRoute,
        public router: Router) {}

    capchaResult(event){
        this.recaptchaDialog?.close();
        localStorage.setItem('recaptchaId', event);
        this.token = this.activeRoute.snapshot.params['token'];
        if (this.token !== undefined) {
            this.subscriptions.add(
                this.auth.confirmEmail(this.token).subscribe(({ data }) => {
                    this.validated = true;
                    this.valid = true;
                }, (error) => {
                    this.validated = true;
                    this.errorMessage = this.errorHandler.getError(error.message, 'Unable to validate email');
                })
            );
        }
    }

    ngAfterViewInit() {
        this.recaptchaDialog = this.modalService.open(this.recaptchaModalContent, {
            backdrop: 'static',
            windowClass: 'modalCusSty',
        });
    }

    ngOnDestroy(): void {
        this.subscriptions.unsubscribe();
    }
}
