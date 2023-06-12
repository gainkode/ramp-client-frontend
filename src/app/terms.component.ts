import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { EnvService } from './services/env.service';

@Component({
	templateUrl: 'terms.component.html',
	styleUrls: ['../assets/button.scss', '../assets/intro.scss']
})
export class TermsComponent {
	title = '';
	id = '';
	logoSrc = `${EnvService.image_host}/images/logo-color.png`;
	logoAlt = EnvService.product;

	constructor(
		private router: Router,
		private route: ActivatedRoute) {
		this.id = this.route.snapshot.params['id'] ?? 'use';
		switch (this.id) {
			case 'privacy':
				this.title = 'Privacy policy';
				break;
			case 'cookie':
				this.title = 'Cookie policy';
				break;
			case 'aml':
				this.title = 'AML / CTF Policy';
				break;
			case 'main':
			default:
				this.title = 'Terms of Use';
				break;
		}
	}

	routeTo(link: string): void {
		this.router.navigateByUrl(link).then(() => {
			window.location.reload();
		});
	}
}
