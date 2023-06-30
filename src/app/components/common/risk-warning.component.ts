import { Component, Input } from '@angular/core';

@Component({
	selector: 'app-risk-warning',
	templateUrl: 'risk-warning.component.html',
	styleUrls: []
})
export class RiskWarningComponent {
    @Input() warningText = '';
}
