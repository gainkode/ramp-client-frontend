import { NgModule } from '@angular/core';
import { NgxMaskModule, IConfig } from 'ngx-mask';
import { NgSelectModule } from '@ng-select/ng-select';
import { MatTabsModule } from '@angular/material/tabs';
import { MAT_CHIPS_DEFAULT_OPTIONS, MatChipsModule } from '@angular/material/chips';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatListModule } from '@angular/material/list';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatSortModule } from '@angular/material/sort';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { ComponentsModule, MaterialModule } from '../components/components.module';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatCardModule } from '@angular/material/card';
import { MatExpansionModule } from '@angular/material/expansion';
import { COMMA, ENTER } from '@angular/cdk/keycodes';
import { DirectiveModule } from '../directives/directives.module';
import { MatRadioModule } from '@angular/material/radio';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { ColorPickerModule } from 'ngx-color-picker';
import { PerfectScrollbarModule, PERFECT_SCROLLBAR_CONFIG, PerfectScrollbarConfigInterface } from 'ngx-perfect-scrollbar';
import { AdminRoutingModule } from './admin.routing.module';
import { AdminComponent } from './admin.component';
import { AdminGuard } from './admin.guard';
import { AdminHeaderComponent } from './layout/header/header.component';
import { AdminSidebarComponent } from './layout/sidebar/sidebar.component';
import { AdminSwitcherComponent } from './layout/switcher/switcher.component';
import { AdminPageHeaderComponent } from './layout/page-header/page-header.component';
import { AdminDataService } from '../services/admin-data.service';
import { AdminFilterComponent } from './misc/filter/filter.component';
import { AdminDetailsItemComponent } from './misc/details-item/details-item.component';
import { AdminDateRangeComponent } from './misc/date-range/date-range.component';
import { AdminFiatWalletDetailsComponent } from './components/wallets/fiat/fiat-wallet-details.component';
import { AdminFiatWalletsComponent } from './components/wallets/fiat/fiat-wallets.component';
import { AdminCryptoWalletDetailsComponent } from './components/wallets/crypto/crypto-wallet-details.component';
import { AdminCryptoWalletsComponent } from './components/wallets/crypto/crypto-wallets.component';
import { AdminCustomersComponent } from './components/users/customers/customers.component';
import { AdminMessageDialogComponent } from './components/users/send-message/send-message.component';
import { AdminCustomerDetailsComponent } from './components/users/customers/customer-details/customer-details.component';
import { AdminCustomerDocsComponent } from './components/users/customers/customer-docs/customer-docs.component';
import { AdminSystemUsersComponent } from './components/users/system/users.component';
import { AdminUserDetailsComponent } from './components/users/system/user-details.component';
import { AdminRoleSelectComponent } from './misc/role-select/role-select.component';
import { AdminRisksComponent } from './components/risks/risks.component';
import { AdminRiskDetailsComponent } from './components/risks/risk-details.component';
import { AdminNotificationsComponent } from './components/notifications/notifications.component';
import { AdminNotificationDetailsComponent } from './components/notifications/notification-details.component';
import { AdminMessagesComponent } from './components/message/messages.component';
import { AdminMessageDetailsComponent } from './components/message/message-details.component';
import { AdminWidgetsComponent } from './components/widgets/widgets.component';
import { AdminWidgetDetailsComponent } from './components/widgets/widget-details.component';
import { AdminCountryBlackListComponent } from './components/kyc/blacklist/countries.component';
import { AdminCountryBlackListDetailsComponent } from './components/kyc/blacklist/blacklist-details.component';
import { AdminLevelsComponent } from './components/kyc/levels/levels.component';
import { AdminLevelDetailsComponent } from './components/kyc/levels/level-details.component';
import { AdminBankAccountDetailsComponent } from './components/costs/bank-accounts/account-details.component';
import { AdminBankAccountsComponent } from './components/costs/bank-accounts/accounts.component';
import { AdminKycSchemesComponent } from './components/kyc/schemes/schemes.component';
import { AdminKycSchemeDetailsComponent } from './components/kyc/schemes/kyc-details.component';
import { AdminCostSchemesComponent } from './components/costs/schemes/schemes.component';
import { AdminCostSchemeDetailsComponent } from './components/costs/schemes/cost-details.component';
import { AdminFeeSchemesComponent } from './components/fees/fees.component';
import { AdminFeeSchemeDetailsComponent } from './components/fees/details/fee-details.component';
import { AdminFeeAssignCostComponent } from './components/fees/assign-cost/fee-assign-cost.component';
import { AdminDashboardCardComponent } from './misc/dashboard-card/dashboard-card.component';
import { AdminUserDevicesComponent } from './components/users/devices/devices.component';
import { AdminDeviceDetailsComponent } from './components/users/devices/device-details.component';
import { AdminKycTiersComponent } from './components/kyc/tiers/tiers.component';
import { AdminKycTierDetailsComponent } from './components/kyc/tiers/tier-details.component';
import { AdminUserActionsComponent } from './components/users/actions/actions.component';
import { AdminActionDetailsComponent } from './components/users/actions/action-details.component';
import { CustomerDocsApi } from './components/users/customers/services/customer-docs.api';
import { CustomerDocsFacadeService } from './components/users/customers/services/customer-docs.service';
import { CustomerDocsStateService } from './components/users/customers/services/customer-docs.state';
import { TableModule } from 'components/data-list/table/table.module';
import { SpinnerModule } from 'shared/spinner/spinner.module';
import { 
	AdminTransactionsComponent, 
	AdminTransactionDetailsComponent, 
	AdminTransactionStatusHistoryComponent, 
	AdminTransactionCreateComponent,
	TransactionLifelineComponent,
	TransactionSimulationComponent,
	TransactionRefundModalComponent,
} from './components/transactions';
import { MatStepperModule } from '@angular/material/stepper';
import { RawJsonModule } from 'shared/raw-json/raw-json.module';
import { 
	AdminDashboardWrapperComponent, 
	DashboardAdminComponent, 
	DashboardMerchantComponent
} from './components/dashboard';
import { 
	AdminApiKeyDetailsComponent, 
	AdminApiKeysComponent, 
	AdminCommonSettingsComponent, 
	AdminCurrencyPairDetailsComponent, 
	AdminCurrencyPairsComponent, 
	AdminWithdrawalAddressComponent,
	FaqPageComponent
} from './components/settings';
import { FeeSimiliarPanelComponent } from './components/fees/details/fee-similiar-panel/fee-similiar-panel.component';
import { CostSimiliarPanelComponent } from './components/costs/schemes/cost-similiar-panel/cost-similiar-panel.component';
import { SharedModule } from 'shared/shared.module';
import { FeeRiskCodesComponent } from './components/fees/details/fee-risk-codes/fee-risk-codes.component';


export const options: Partial<IConfig> | (() => Partial<IConfig>) | null = null;

const DEFAULT_PERFECT_SCROLLBAR_CONFIG: PerfectScrollbarConfigInterface = {
	suppressScrollX: true
};

@NgModule({
	imports: [
		NgxMaskModule.forRoot(), 
		SharedModule,
		TableModule,
		NgSelectModule,
		NgbModule,
		MatCardModule,
		MatChipsModule,
		MatRadioModule,
		MatExpansionModule,
		MatSidenavModule,
		MatTooltipModule,
		MatTabsModule,
		MatListModule,
		MatTableModule,
		MatPaginatorModule,
		MatProgressSpinnerModule,
		SpinnerModule,
		RawJsonModule,
		MatSortModule,
		MatButtonModule,
		MatFormFieldModule,
		MatInputModule,
		MatSelectModule,
		MatAutocompleteModule,
		MatIconModule,
		MatSlideToggleModule,
		MatProgressBarModule,
		DragDropModule,
		MatToolbarModule,
		MatStepperModule,
		MatSnackBarModule,
		ColorPickerModule,
		PerfectScrollbarModule,
		ComponentsModule,
		AdminRoutingModule,
		MaterialModule,
		DirectiveModule,

		FeeSimiliarPanelComponent,
		CostSimiliarPanelComponent
	],
	declarations: [
		AdminComponent,
		AdminHeaderComponent,
		AdminPageHeaderComponent,
		AdminSidebarComponent,
		AdminSwitcherComponent,
		AdminDetailsItemComponent,
		AdminDashboardCardComponent,
		AdminDateRangeComponent,
		AdminFilterComponent,
		DashboardAdminComponent,
		DashboardMerchantComponent,
		AdminDashboardWrapperComponent,

		TransactionLifelineComponent,
		TransactionSimulationComponent,
		TransactionRefundModalComponent,
		AdminTransactionsComponent, 
		AdminTransactionDetailsComponent, 
		AdminTransactionStatusHistoryComponent, 
		AdminTransactionCreateComponent,
		AdminFiatWalletsComponent, 
		AdminFiatWalletDetailsComponent,
		AdminCryptoWalletsComponent, 
		AdminCryptoWalletDetailsComponent,
		AdminCustomersComponent, 
		AdminCustomerDetailsComponent,
		AdminCustomerDocsComponent,
		AdminSystemUsersComponent, 
		AdminUserDetailsComponent, 
		AdminRoleSelectComponent, 
		AdminMessageDialogComponent,
		AdminUserDevicesComponent, 
		AdminDeviceDetailsComponent,
		AdminUserActionsComponent, 
		AdminActionDetailsComponent,
		AdminNotificationsComponent, 
		AdminNotificationDetailsComponent,
		AdminMessagesComponent, 
		AdminMessageDetailsComponent,
		AdminRisksComponent, 
		AdminRiskDetailsComponent,
		AdminWidgetsComponent, 
		AdminWidgetDetailsComponent,
		AdminFeeSchemesComponent, 
		AdminFeeSchemeDetailsComponent, 
		AdminFeeAssignCostComponent,
		AdminLevelsComponent, 
		AdminLevelDetailsComponent,
		AdminKycTiersComponent, 
		AdminKycTierDetailsComponent,
		AdminKycSchemesComponent, 
		AdminKycSchemeDetailsComponent,
		AdminCountryBlackListComponent, 
		AdminCountryBlackListDetailsComponent,
		AdminCostSchemesComponent, 
		AdminCostSchemeDetailsComponent,
		AdminBankAccountsComponent, 
		AdminBankAccountDetailsComponent,
		AdminCommonSettingsComponent, 
		AdminWithdrawalAddressComponent,
		AdminApiKeysComponent, 
		AdminApiKeyDetailsComponent, 
		AdminCurrencyPairsComponent, 
		AdminCurrencyPairDetailsComponent,
		
		FeeRiskCodesComponent,
		FaqPageComponent
	],
	providers: [
		AdminGuard,
		AdminDataService,

		CustomerDocsApi,
		CustomerDocsStateService,
		CustomerDocsFacadeService,

		{
			provide: MAT_CHIPS_DEFAULT_OPTIONS,
			useValue: {
				separatorKeyCodes: [ENTER, COMMA]
			}
		},
		{
			provide: PERFECT_SCROLLBAR_CONFIG,
			useValue: DEFAULT_PERFECT_SCROLLBAR_CONFIG
		}
	]
})
export class AdminModule {
}
