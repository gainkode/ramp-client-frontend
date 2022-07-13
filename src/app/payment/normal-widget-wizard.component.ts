import { Component } from '@angular/core';
import { EnvService } from '../services/env.service';

@Component({
  templateUrl: 'normal-widget-wizard.component.html',
  styleUrls: ['../../assets/payment.scss'],
})
export class NormalWidgetWizardComponent {
  bg_mask = (EnvService.widget_bg_mask === 'true');
}
