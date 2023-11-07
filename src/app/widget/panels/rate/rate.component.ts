import { Component, Input } from '@angular/core';

@Component({
	selector: 'app-widget-rate',
	templateUrl: 'rate.component.html'
})
export class WidgetRateComponent {
    @Input() title = '';
    @Input() countDown = '';
    @Input() currencySpend = '';
    @Input() currencyReceive = '';
    @Input() rate: string | undefined = undefined;
    @Input() showRate: boolean | undefined = undefined;

    constructor() { }
}
