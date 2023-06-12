import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

@Component({
	templateUrl: 'crypto-widget-wrap.component.html',
	styleUrls: ['../../assets/payment.scss']
})
export class CryptoWidgetWrapComponent {
	userParamsId = '';

	constructor(private route: ActivatedRoute) {
		this.userParamsId = this.route.snapshot.params['userParamsId'] ?? '';
	}
}
