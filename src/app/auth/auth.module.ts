import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatTooltipModule } from '@angular/material/tooltip'; 
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatRadioModule } from '@angular/material/radio';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { ComponentsModule } from '../components/components.module';
import { LoginComponent } from './login.component';
import { RegisterComponent } from './register.component';
import { SignupComponent } from './signup.component';
import { SuccessComponent } from './success.component';
import { RestoreComponent } from './restore.component';
import { ConfirmEmailComponent } from './confirm-email.component';
import { ResetComponent } from './reset.component';
import { TermsComponent } from './terms.component';

const routing = RouterModule.forChild([
    { path: 'login', component: LoginComponent },
    { path: 'register', component: RegisterComponent },
    { path: 'signup/:token', component: SignupComponent },
    { path: 'success/:type', component: SuccessComponent },
    { path: 'confirm-email/:token', component: ConfirmEmailComponent },
    { path: 'new-password/:token', component: ResetComponent },
    { path: 'restore', component: RestoreComponent },
    { path: 'terms', component: TermsComponent },
    { path: '**', redirectTo: 'login' }
]);

const modules = [
    MatButtonModule,
    MatFormFieldModule,
    MatTooltipModule,
    MatInputModule,
    MatCheckboxModule,
    MatRadioModule,
    MatAutocompleteModule,
    MatIconModule,
    MatProgressBarModule,
    ComponentsModule
];

@NgModule({
    imports: [...modules],
    exports: [...modules]
})
export class MaterialModule { }

@NgModule({
    imports: [
        CommonModule, FormsModule, ReactiveFormsModule, routing, MaterialModule
    ],
    declarations: [
        LoginComponent, RegisterComponent, SignupComponent, SuccessComponent, RestoreComponent,
        ConfirmEmailComponent, ResetComponent, TermsComponent
    ],
    schemas: [
        CUSTOM_ELEMENTS_SCHEMA
    ]
})
export class AuthModule { }
