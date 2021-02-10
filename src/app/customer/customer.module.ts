import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from "@angular/core";
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { RouterModule } from "@angular/router";
import { MatTabsModule } from '@angular/material/tabs'; 
import { MatFormFieldModule } from '@angular/material/form-field'; 
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox'; 
import { MatRadioModule } from '@angular/material/radio'; 
import { MatIconModule } from '@angular/material/icon'; 
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { CustomerComponent } from "./customer.component";
//import { RegisterComponent } from "./register.component";
//import { SignupSuccessComponent } from './signup-success.component';

const routing = RouterModule.forChild([
    { path: "main", component: CustomerComponent },
    //{ path: 'register', component: RegisterComponent },
    //{ path: 'reg-success', component: SignupSuccessComponent },
    { path: "**", redirectTo: "main" }
]);

const modules = [
    MatTabsModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatCheckboxModule,
    MatRadioModule,
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
    declarations: [CustomerComponent],
    schemas: [
      CUSTOM_ELEMENTS_SCHEMA
    ]
})
export class CustomerModule { }