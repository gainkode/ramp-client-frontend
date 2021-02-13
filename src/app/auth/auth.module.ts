import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from "@angular/core";
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { RouterModule } from "@angular/router";
import { MatFormFieldModule } from '@angular/material/form-field'; 
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox'; 
import { MatRadioModule } from '@angular/material/radio'; 
import { MatIconModule } from '@angular/material/icon'; 
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { LoginComponent } from "./login.component";
import { RegisterComponent } from "./register.component";
import { SuccessComponent } from './success.component';
import { RestoreComponent } from './restore.component';
import { ConfirmEmailComponent } from './confirm-email.component';
import { TermsComponent } from './terms.component';

const routing = RouterModule.forChild([
    { path: "login", component: LoginComponent },
    { path: 'register', component: RegisterComponent },
    { path: 'success/:type', component: SuccessComponent },
    { path: 'confirm-email', component: ConfirmEmailComponent },
    { path: 'confirm-email/:token', component: ConfirmEmailComponent },
    { path: 'restore', component: RestoreComponent },
    { path: 'terms', component: TermsComponent },
    { path: "**", redirectTo: "login" }
]);

const modules = [
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatCheckboxModule,
    MatRadioModule,
    MatAutocompleteModule,
    MatIconModule,
    MatProgressBarModule
];
  
@NgModule({
    imports: [...modules],
    exports: [...modules]
})
export class MaterialModule {};
  
@NgModule({
    imports: [
        CommonModule, FormsModule, ReactiveFormsModule, routing, MaterialModule
    ],
    declarations: [
        LoginComponent, RegisterComponent, SuccessComponent, RestoreComponent, ConfirmEmailComponent, 
        TermsComponent],
    schemas: [
      CUSTOM_ELEMENTS_SCHEMA
    ]
})
export class AuthModule { }