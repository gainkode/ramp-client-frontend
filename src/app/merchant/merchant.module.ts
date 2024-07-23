import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatTabsModule } from '@angular/material/tabs';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatRadioModule } from '@angular/material/radio';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MerchantGuard } from './merchant.guard';
import { MerchantComponent } from './merchant.component';
import { ComponentsModule } from '../components/components.module';
import { MerchantLoginComponent } from './auth/login.component';
import { MerchantRestoreComponent } from './auth/restore.component';
import { MerchantSuccessComponent } from './auth/success.component';
import { MerchantRegisterComponent } from './auth/register.component';
import { MerchantResetComponent } from './auth/reset.component';
import { MerchantConfirmEmailComponent } from './auth/confirm-email.component';
import { MerchantConfirmDeviceComponent } from './auth/confirm-device.component';
import { WidgetModule } from '../widget/widget.module';
import { ProfileModule } from '../profile/profile.module';
import { MerchantRoutingModule } from './merchant-routing.module';

const modules = [
	MatTabsModule,
	MatButtonModule,
	MatFormFieldModule,
	MatInputModule,
	MatTooltipModule,
	MatCheckboxModule,
	MatRadioModule,
	MatIconModule,
	MatProgressBarModule,
	ComponentsModule,
	WidgetModule,
	ProfileModule
];

@NgModule({
	imports: [...modules],
	exports: [...modules]
})
export class MaterialModule { }

@NgModule({
	imports: [ CommonModule, FormsModule, ReactiveFormsModule, MerchantRoutingModule, MaterialModule ],
	declarations: [
		// Auth
		MerchantLoginComponent, MerchantRegisterComponent, MerchantRestoreComponent, MerchantResetComponent,
		MerchantConfirmEmailComponent, MerchantConfirmDeviceComponent, MerchantSuccessComponent,
		// Profile main
		MerchantComponent],
	providers: [MerchantGuard],
})
export class MerchantModule { }
