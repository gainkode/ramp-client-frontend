import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
	templateUrl: 'dashboard-wrapper.component.html',
	styleUrls: ['dashboard-wrapper.component.scss'],
	changeDetection: ChangeDetectionStrategy.OnPush
})
export class AdminDashboardWrapperComponent {
	constructor() {

	}

}
