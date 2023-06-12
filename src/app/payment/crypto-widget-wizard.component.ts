import { Component } from '@angular/core';
import { EnvService } from '../services/env.service';

@Component({
	templateUrl: 'crypto-widget-wizard.component.html',
	styleUrls: ['../../assets/payment.scss'],
})
export class CryptoWidgetWizardComponent {
	bg_mask = (EnvService.widget_bg_mask === 'true');
}
