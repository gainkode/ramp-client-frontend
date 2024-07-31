import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { EnvService } from 'services/env.service';
import { AuthService } from '../../services/auth.service';
import { PreSettingsCommon } from 'model/generated-models';
import { Subscription } from 'rxjs';

@Component({
	templateUrl: 'register.component.html',
	styleUrls: ['../../../assets/auth.scss']
})
export class PersonalRegisterComponent implements OnInit{
	inProgress = false;
	errorMessage = '';
	logoSrc = `${EnvService.image_host}/images/logo-widget.png`;
	logoAlt = EnvService.product;
	preSettingsCommon: PreSettingsCommon = undefined;
	
	private subscriptions: Subscription = new Subscription();

	constructor(public router: Router, private auth: AuthService) { }

	ngOnInit() {
		this.subscriptions.add(
			this.auth.getPreSettingsCommon().subscribe({
				next: ({ data }) => {
					this.preSettingsCommon = data.getPreSettingsCommon;
				}
			})
		);
	}

	onError(error: string): void {
		this.errorMessage = error;
	}

	onProgressChange(visible: boolean): void {
		this.inProgress = visible;
	}

	onRegistered(email: string): void {
		this.router.navigateByUrl('/personal/auth/success/signup');
	}
}
