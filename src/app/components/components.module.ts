import { CommonModule } from '@angular/common';
import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ClipboardModule } from '@angular/cdk/clipboard';
import { QRCodeModule } from 'angularx-qrcode';
import { NgxMaskModule, IConfig } from 'ngx-mask';

import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatChipsModule } from '@angular/material/chips';
import { MatDialogModule } from '@angular/material/dialog';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatListModule } from '@angular/material/list';
import { MatMenuModule } from '@angular/material/menu';
import { MatInputModule } from '@angular/material/input';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatSelectModule } from '@angular/material/select';
import { MatSortModule } from '@angular/material/sort';

import { DirectiveModule } from '../directives/directives.module';
import { LineBreakPipe } from '../utils/line-break.pipe';
import { NumberFillPipe } from '../utils/number-fill.pipe';

import { DropdownItemComponent } from './common/dropdown-item.component';
import { TabLabelComponent } from './common/tablabel.component';
import { LoginPanelComponent } from './auth/login-panel.component';
import { RestorePanelComponent } from './auth/restore-panel.component';
import { NavPopupComponent } from './common/nav-popup/nav-popup.component';
import { SideExpanderComponent } from './common/side-expander.component';
import { SideMenuComponent } from './common/side-menu.component';
import { SignUpPanelComponent } from './auth/signup-panel.component';
import { SignupInfoPanelComponent } from './auth/signup-info.component';
import { TransactionsFilterBarComponent } from './filter-bars/transactions-bar.component';
import { NotificationsFilterBarComponent } from './filter-bars/notifications-bar.component';
import { DeleteDialogBox } from './dialogs/delete-box.dialog';
import { WalletsFilterBarComponent } from './filter-bars/wallets-bar.component';
import { ContactsFilterBarComponent } from './filter-bars/contacts-bar.component';
import { RiskWarningComponent } from './common/risk-warning.component';
import { CommonDialogBox } from './dialogs/common-box.dialog';
import { TwoFaDialogBox } from './dialogs/two-fa-box.dialog';
import { TwoFaDialogWizard } from './dialogs/two-fa-wizard.dialog';
import { SendNotificationDialogBox } from './dialogs/send-notification-box.dialog';
import { KycVerificationDialogBox } from './dialogs/kyc-verification.dialog';
import { ContactFormComponent } from './contact-form.component';
import { YesNoDialogBox } from './dialogs/yesno-box.dialog';
import { ApiSecretDialogBox } from './dialogs/api-secret-box.dialog';
import { SafeUrlPipe } from '../utils/safe-url.pipe';
import { RecaptchaComponent } from './recaptcha/recaptcha.component';
import { NgxTurnstileModule } from 'ngx-turnstile';
import { RecaptchaModule } from 'ng-recaptcha';
import { 
	ShuftiPanelComponent, 
	SumsubPanelComponent, 
	AutentixPanelComponent,
	KycCompanyLevelVerificationComponent, 
	KycPanelComponent 
} from './kyc';
import { 
	FormTextBoxComponent, 
	SettingsPasswordBoxComponent,
	FormFinanceComboComponent,
	FormPasswordBoxComponent,
	FormCardBoxComponent,
	FormSearchBoxComponent,
	FormEditBoxComponent
} from './common/controls';

export const options: Partial<IConfig> | (() => Partial<IConfig>) | null = null;

const materialModules = [
	ClipboardModule,
	MatButtonModule,
	MatFormFieldModule,
	MatInputModule,
	MatAutocompleteModule,
	MatSlideToggleModule,
	MatCheckboxModule,
	MatSelectModule,
	MatTooltipModule,
	MatChipsModule,
	MatDatepickerModule,
	MatNativeDateModule,
	MatDialogModule,
	MatIconModule,
	MatListModule,
	MatMenuModule,
	MatProgressSpinnerModule,
	MatProgressBarModule,
	MatSnackBarModule,
	MatTableModule,
	MatPaginatorModule,
	MatSortModule,
	NgxTurnstileModule,
	RecaptchaModule,
];

@NgModule({
	imports: [...materialModules],
	exports: [...materialModules],
})
export class MaterialModule {}

const kycComponents = [
	ShuftiPanelComponent, 
	SumsubPanelComponent, 
	AutentixPanelComponent,
	KycCompanyLevelVerificationComponent, 
	KycPanelComponent 
];

const formControlComponents = [
	FormTextBoxComponent, 
	SettingsPasswordBoxComponent,
	FormFinanceComboComponent,
	FormPasswordBoxComponent,
	FormCardBoxComponent,
	FormSearchBoxComponent,
	FormEditBoxComponent
];

@NgModule({
	imports: [
		NgxMaskModule.forRoot(),
		CommonModule,
		FormsModule,
		ReactiveFormsModule,
		MaterialModule,
		DirectiveModule,
		QRCodeModule,
	],
	declarations: [
		[...kycComponents],
		[...formControlComponents],
		DropdownItemComponent,
		TabLabelComponent,
		ContactFormComponent,
		RecaptchaComponent,
		DeleteDialogBox,
		CommonDialogBox,
		TwoFaDialogBox,
		TwoFaDialogWizard,
		SendNotificationDialogBox,
		KycVerificationDialogBox,
		YesNoDialogBox,
		ApiSecretDialogBox,
		LoginPanelComponent,
		SignUpPanelComponent,
		SignupInfoPanelComponent,
		RestorePanelComponent,
		NavPopupComponent,
		SideMenuComponent,
		SideExpanderComponent,
		RiskWarningComponent,
		LineBreakPipe,
		NumberFillPipe,
		SafeUrlPipe,
		TransactionsFilterBarComponent,
		WalletsFilterBarComponent,
		ContactsFilterBarComponent,
		NotificationsFilterBarComponent,
	],
	exports: [
		[...kycComponents],
		[...formControlComponents],
		DropdownItemComponent,
		TabLabelComponent,
		ContactFormComponent,
		RecaptchaComponent,
		DeleteDialogBox,
		CommonDialogBox,
		TwoFaDialogBox,
		TwoFaDialogWizard,
		SendNotificationDialogBox,
		KycVerificationDialogBox,
		YesNoDialogBox,
		ApiSecretDialogBox,
		LoginPanelComponent,
		SignUpPanelComponent,
		SignupInfoPanelComponent,
		RestorePanelComponent,
		NavPopupComponent,
		SideMenuComponent,
		SideExpanderComponent,
		RiskWarningComponent,
		LineBreakPipe,
		NumberFillPipe,
		SafeUrlPipe,
		TransactionsFilterBarComponent,
		WalletsFilterBarComponent,
		ContactsFilterBarComponent,
		NotificationsFilterBarComponent,
	],
	schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class ComponentsModule {}
