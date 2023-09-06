import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { AuthService } from 'services/auth.service';
import { EnvService } from 'services/env.service';
import { ErrorService } from 'services/error.service';

@Component({
	templateUrl: 'confirm-email.component.html',
	styleUrls: ['../../../assets/auth.scss'],
	changeDetection: ChangeDetectionStrategy.OnPush
})
export class PersonalConfirmEmailComponent implements OnDestroy {
	token = '';
	validated: boolean;
	valid: boolean;
	errorMessage = '';
	logoSrc = `${EnvService.image_host}/images/logo-widget.png`;
	logoAlt = EnvService.product;
	private subscriptions: Subscription = new Subscription();

	constructor(
		private auth: AuthService,
		private cdr: ChangeDetectorRef,
		private errorHandler: ErrorService,
		public router: Router,
		public activeRoute: ActivatedRoute) {

		this.token = this.activeRoute.snapshot.params['token'];
	}

	capchaResult(event: string): void{
		localStorage.setItem('recaptchaId', event);

		if (this.token) {
			this.validated = false;
			const subscription = this.auth.confirmEmail(this.token)
				.subscribe({
					next: () => this.valid = true,
					error: (err) => {
						this.valid = false;
						this.validated = true;
						this.errorMessage = this.errorHandler.getError(err.message, 'Unable to validate email');
						this.cdr.detectChanges();
					},
					complete: () => {
						this.validated = true;
					}
				});
			this.cdr.detectChanges();
			this.subscriptions.add(subscription);
		}
	}

	ngOnDestroy(): void {
		this.subscriptions.unsubscribe();
	}
}
