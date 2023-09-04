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
export class PersonalConfirmEmailComponent implements OnDestroy, AfterViewInit {
	token = '';
	validated = false;
	valid = false;
	errorMessage = '';
	logoSrc = `${EnvService.image_host}/images/logo-widget.png`;
	logoAlt = EnvService.product;
    @ViewChild('recaptcha') private recaptchaModalContent; 

    private subscriptions: Subscription = new Subscription();
    private recaptchaDialog: NgbModalRef | undefined = undefined; 

    constructor(
    	private modalService: NgbModal,
    	private auth: AuthService,
    	private errorHandler: ErrorService,
    	public router: Router,
    	public activeRoute: ActivatedRoute) {
    }

    capchaResult(event: string): void{
    	localStorage.setItem('recaptchaId', event);
    	this.token = this.activeRoute.snapshot.params['token'];
    	this.validated = true;

    	if (this.token) {
    		const subscription = this.auth.confirmEmail(this.token)
    			.subscribe({
    				next: () => this.valid = true,
    				error: (err) => {
    					this.recaptchaDialog?.close();
    					this.errorMessage = this.errorHandler.getError(err.message, 'Unable to validate email');
    				},
    				complete: () => {
    					this.validated = true;
    					this.recaptchaDialog?.close();
    				}
    			});
			
    		this.subscriptions.add(subscription);
    	} else {
    		this.recaptchaDialog?.close();
    	}
    }

    ngAfterViewInit(): void {
    	this.recaptchaDialog = this.modalService.open(this.recaptchaModalContent, {
    		backdrop: 'static',
    		windowClass: 'modalCusSty',
    	});
    }
    ngOnDestroy(): void {
    	this.subscriptions.unsubscribe();
    }
}
