import { CommonModule } from '@angular/common';
import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ClipboardModule } from '@angular/cdk/clipboard';
import { QRCodeModule } from 'angularx-qrcode';
import { NgxMaskModule, IConfig } from 'ngx-mask'

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
import { BackButtonComponent } from './common/backbutton.component';
import { TabLabelComponent } from './common/tablabel.component';
import { KycPanelComponent } from './kyc-panel.component';
import { LoginPanelComponent } from './auth/login-panel.component';
import { TwoFaCodeComponent } from './auth/two-fa-code.component';
import { NavPopupComponent } from './common/nav-popup/nav-popup.component';
import { SideExpanderComponent } from './common/side-expander.component';
import { SideMenuComponent } from './common/side-menu.component';
import { SignUpPanelComponent } from './auth/signup-panel.component';
import { SignupInfoPanelComponent } from './auth/signup-info.component';

import { ProfileInfoComponent } from './profile/profile-info.component';
import { ProfileTwoFAComponent } from './profile/profile-two-fa.component';
import { ProfilePasswordComponent } from './profile/profile-password.component';
import { TransactionsFilterBarComponent } from './filter-bars/transactions-bar.component';
import { FormTextBoxComponent } from './common/controls/form-textbox.component';
import { FormFinanceComboComponent } from './common/controls/form-finance-combo.component';
import { FormPasswordBoxComponent } from './common/controls/form-password.component';
import { FormCardBoxComponent } from './common/controls/form-cardbox.component';
import { NotificationsFilterBarComponent } from './filter-bars/notifications-bar.component';
import { FormSearchBoxComponent } from './common/controls/form-searchbox.component';
import { DeleteDialogBox } from './dialogs/delete-box.dialog';
import { WalletsFilterBarComponent } from './filter-bars/wallets-bar.component';
import { FormEditBoxComponent } from './common/controls/form-editbox.component';
import { ContactsFilterBarComponent } from './filter-bars/contacts-bar.component';
import { RiskWarningComponent } from './common/risk-warning.component';
import { SettingsPasswordBoxComponent } from './common/controls/settings-password.component';
import { CommonDialogBox } from './dialogs/common-box.dialog';

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
    MatSortModule
];

@NgModule({
    imports: [...materialModules],
    exports: [...materialModules]
})
export class MaterialModule { }

@NgModule({
    imports: [NgxMaskModule.forRoot(), CommonModule, FormsModule, ReactiveFormsModule, MaterialModule, DirectiveModule, QRCodeModule],
    declarations: [
        DropdownItemComponent, BackButtonComponent, TabLabelComponent, KycPanelComponent,
        FormTextBoxComponent, FormPasswordBoxComponent, FormFinanceComboComponent, FormCardBoxComponent, FormSearchBoxComponent,
        FormEditBoxComponent, SettingsPasswordBoxComponent,
        DeleteDialogBox, CommonDialogBox,
        LoginPanelComponent, SignUpPanelComponent, SignupInfoPanelComponent,
        TwoFaCodeComponent, NavPopupComponent, SideMenuComponent, SideExpanderComponent, RiskWarningComponent,
        LineBreakPipe, NumberFillPipe,
        TransactionsFilterBarComponent, WalletsFilterBarComponent, ContactsFilterBarComponent, NotificationsFilterBarComponent,
        
        ProfileInfoComponent, ProfileTwoFAComponent, ProfilePasswordComponent],
    exports: [
        DropdownItemComponent, BackButtonComponent, TabLabelComponent, KycPanelComponent,
        FormTextBoxComponent, FormPasswordBoxComponent, FormFinanceComboComponent, FormCardBoxComponent, FormSearchBoxComponent,
        FormEditBoxComponent, SettingsPasswordBoxComponent,
        DeleteDialogBox, CommonDialogBox,
        LoginPanelComponent, SignUpPanelComponent, SignupInfoPanelComponent,
        TwoFaCodeComponent, NavPopupComponent, SideMenuComponent, SideExpanderComponent, RiskWarningComponent,
        LineBreakPipe, NumberFillPipe,
        TransactionsFilterBarComponent, WalletsFilterBarComponent, ContactsFilterBarComponent, NotificationsFilterBarComponent,
        
        ProfileInfoComponent, ProfileTwoFAComponent, ProfilePasswordComponent],
    schemas: [CUSTOM_ELEMENTS_SCHEMA]
})

export class ComponentsModule { }
