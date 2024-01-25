import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { EnvService } from 'services/env.service';

@Component({
	templateUrl: 'restore.component.html',
	styleUrls: ['../../../assets/auth.scss']    
})
export class MerchantRestoreComponent {
	inProgress = false;
	errorMessage = '';
	logoSrc = `${EnvService.image_host}/images/logo-color.png`;
	logoAlt = EnvService.product;

	constructor(public router: Router) { }

	onError(error: string): void {
		this.errorMessage = error;
	}

	onProgressChange(status: boolean): void {
		this.inProgress = status;
	}
}
