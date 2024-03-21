import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { EnvService } from 'services/env.service';

@Component({
	selector: 'app-forbidden',
	templateUrl: './forbidden.component.html',
	styleUrls: ['./forbidden.component.scss'],
})
export class ForbiddenComponent implements OnInit {
	logoSrc = `${EnvService.image_host}/images/logo-widget.png`;
	logoAlt = EnvService.product;
	lastSaveUrl: string;
	navigatToLabel: string;
	isWidget = false;

	constructor(private router: Router) {}
	
	ngOnInit(): void {
		this.lastSaveUrl = localStorage.getItem('LAST_SAVED_URL');
		this.isWidget = this.lastSaveUrl?.includes('/payment/');

		localStorage.removeItem('LAST_SAVED_URL');
		this.navigatToLabel = this.isWidget ? 'Widget' : 'Login';
	}

	navigateTo(): void {
		const loginUrl = '/personal/auth/login';
		void this.router.navigateByUrl(this.isWidget ? this.lastSaveUrl : loginUrl);
	}
}
