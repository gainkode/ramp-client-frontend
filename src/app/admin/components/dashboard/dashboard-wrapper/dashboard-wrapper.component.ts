import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { UserType } from 'model/generated-models';
import { AuthService } from 'services/auth.service';

@Component({
	templateUrl: 'dashboard-wrapper.component.html',
	styleUrls: ['dashboard-wrapper.component.scss'],
	changeDetection: ChangeDetectionStrategy.OnPush
})
export class AdminDashboardWrapperComponent implements OnInit {
	isMerchantDashboard = false;
	constructor(private readonly auth: AuthService) {}

	ngOnInit(): void {
		const isUserTypeMerchant = this.auth.user.type === UserType.Merchant;
		const isUserWithAffilateId = !!this.auth.user.affiliateId;

		console.log(isUserTypeMerchant, isUserWithAffilateId)

		this.isMerchantDashboard = isUserTypeMerchant || isUserWithAffilateId;
	}
}
