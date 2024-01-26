import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatTabsModule } from '@angular/material/tabs';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatRadioModule } from '@angular/material/radio';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatTableModule } from '@angular/material/table';
import { MatSelectModule } from '@angular/material/select';
import { MatSortModule } from '@angular/material/sort';
import { MatListModule } from '@angular/material/list';
import { PersonalComponent } from './personal.component';
import { ComponentsModule } from '../components/components.module';
import { DirectiveModule } from '../directives/directives.module';
import { PersonalLoginComponent } from './auth/login.component';
import { PersonalRestoreComponent } from './auth/restore.component';
import { PersonalRegisterComponent } from './auth/register.component';
import { PersonalSuccessComponent } from './auth/success.component';
import { PersonalConfirmDeviceComponent } from './auth/confirm-device.component';
import { PersonalConfirmEmailComponent } from './auth/confirm-email.component';
import { PersonalResetComponent } from './auth/reset.component';
import { ProfileModule } from '../profile/profile.module';
import { WidgetModule } from '../widget/widget.module';
import { PersonalRoutingModule } from './personal-routing.module';
import { PersonalGuard } from './personal.guard';

const modules = [
	MatTabsModule,
	MatCardModule,
	MatDialogModule,
	MatButtonModule,
	MatFormFieldModule,
	MatInputModule,
	MatTooltipModule,
	MatSelectModule,
	MatCheckboxModule,
	MatRadioModule,
	MatIconModule,
	MatListModule,
	MatProgressBarModule,
	MatPaginatorModule,
	MatTableModule,
	MatSortModule,
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
	imports: [CommonModule, FormsModule, ReactiveFormsModule, PersonalRoutingModule, MaterialModule, DirectiveModule],
	declarations: [
		// Auth
		PersonalLoginComponent, PersonalRegisterComponent, PersonalRestoreComponent, PersonalResetComponent,
		PersonalConfirmEmailComponent, PersonalConfirmDeviceComponent, PersonalSuccessComponent,
		// Profile main
		PersonalComponent],
	providers: [PersonalGuard],
	schemas: [
		CUSTOM_ELEMENTS_SCHEMA
	]
})
export class PersonalModule { }
