import { Component, ViewEncapsulation } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { environment } from '@environments/environment';
import { WidgetSettings } from '../model/payment-base.model';
import { EnvService } from '../services/env.service';
import { Subscription } from 'rxjs';
import { NotificationService } from 'services/notification.service';

@Component({
	templateUrl: 'quickcheckout.component.html',
	styleUrls: [],
	encapsulation: ViewEncapsulation.None
})
export class QuickCheckoutComponent {
	prodMode = environment.production;
	userParamsId = '';
	expressFrom = '';
	expressTo = '';
	expressValue = 0;
	widgetSize = true;
	settings: WidgetSettings | undefined = undefined;
	bg_mask = (EnvService.widget_bg_mask === 'true');
	
	private pSubscriptions: Subscription = new Subscription();

	constructor(
		private route: ActivatedRoute,
		private notification: NotificationService
	) {

		this.userParamsId = this.route.snapshot.params['userParamsId'] ?? '';
		this.expressFrom = this.route.snapshot.params['from'] ?? '';
		this.expressTo = this.route.snapshot.params['to'] ?? '';
		this.expressValue = this.route.snapshot.params['value'] ?? 0;
		if (this.expressFrom !== '' && this.expressTo !== '' && this.expressValue !== 0) {
			this.settings = new WidgetSettings();
			this.settings.currencyFrom = this.expressFrom;
			this.settings.currencyTo = this.expressTo;
			this.settings.amountFrom = this.expressValue;
		}
	}

	iframePay(): void {
		this.widgetSize = false;
	}

	ngOnDestroy(): void {
		this.pSubscriptions.unsubscribe();
	}
}
