import { Component, OnDestroy } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { Validators, UntypedFormBuilder } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { ErrorService } from '../../services/error.service';
import { Subscription } from 'rxjs';
import { EnvService } from 'services/env.service';

@Component({
	templateUrl: 'reset.component.html',
	styleUrls: ['../../../assets/button.scss', '../../../assets/text-control.scss', '../../../assets/auth.scss']
})
export class MerchantResetComponent implements OnDestroy {
	token = '';
	inProgress = false;
	errorMessage = '';
	hidePassword1 = true;
	hidePassword2 = true;
	logoSrc = `${EnvService.image_host}/images/logo-color.png`;
	logoAlt = EnvService.product;

	passwordForm = this.formBuilder.group({
		password1: [,
			{
				validators: [
					Validators.required,
					Validators.minLength(8),
					Validators.pattern('(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[`~$@#!%^_*?&+=<|>])[A-Za-z0-9\d`~$@#!%^_*?&+=<|>].{7,30}')
				], updateOn: 'change'
			}
		],
		password2: [,
			{
				validators: [
					Validators.required,
					Validators.minLength(8)
				], updateOn: 'change'
			}
		]
	});

	passwordErrorMessages: { [key: string]: string; } = {
		['required']: 'Password is required',
		['minlength']: 'Password must contain at least 8 symbols',
		['pattern']: 'Please make sure your password is al least 8 symbols length and contains lower-case, upper-case, and special symbols'
	};

	private subscriptions: Subscription = new Subscription();

	constructor(
		private auth: AuthService,
		private errorHandler: ErrorService,
		private formBuilder: UntypedFormBuilder,
		public router: Router,
		public activeRoute: ActivatedRoute) {
		this.token = activeRoute.snapshot.params['token'];
	}

	ngOnDestroy(): void {
		this.subscriptions.unsubscribe();
	}

	passwordsEqual(): boolean {
		const p1 = this.passwordForm.get('password1')?.value;
		const p2 = this.passwordForm.get('password2')?.value;
		return (p1 === p2);
	}

	onSubmit(): void {
		this.errorMessage = '';
		if (this.passwordForm.valid) {
			if (!this.passwordsEqual()) {
				this.errorMessage = 'Passwords are not equal';
			} else {
				this.inProgress = true;
				const password = this.passwordForm.get('password1')?.value;
				this.subscriptions.add(
					this.auth.setPassword(this.token, password).subscribe(({ data }) => {
						this.inProgress = false;
						this.router.navigateByUrl('/merchant/auth/success/reset');
					}, (error) => {
						this.inProgress = false;
						this.errorMessage = this.errorHandler.getError(error.message, 'Unable to reset password');
					})
				);
			}
		}
	}
}
