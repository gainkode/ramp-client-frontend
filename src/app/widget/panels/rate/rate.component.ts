import { Component, Input } from '@angular/core';

@Component({
	selector: 'app-widget-rate',
	templateUrl: 'rate.component.html',
	styleUrls: ['../../../../assets/payment.scss']
})
export class WidgetRateComponent {
    @Input() title = '';
    @Input() countDown = '';
    @Input() rate: string | undefined = undefined;
    @Input() showRate: boolean | undefined = undefined;

    constructor() { }
}
