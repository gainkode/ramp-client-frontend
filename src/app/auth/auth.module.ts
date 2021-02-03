import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from "@angular/core";
import { CommonModule } from '@angular/common';
import { FormsModule } from "@angular/forms";
import { RouterModule } from "@angular/router";
import { MatFormFieldModule } from '@angular/material/form-field'; 
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { LoginComponent } from "./login.component";
import { RegisterComponent } from "./register.component";

const routing = RouterModule.forChild([
    { path: "login", component: LoginComponent },
    { path: 'register', component: RegisterComponent },
    { path: "**", redirectTo: "login" }
]);

const modules = [
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule
];
  
@NgModule({
    imports: [...modules],
    exports: [...modules]
})
export class MaterialModule {};
  
@NgModule({
    imports: [
        CommonModule, FormsModule, routing, MaterialModule
    ],
    declarations: [LoginComponent, RegisterComponent],
    schemas: [
      CUSTOM_ELEMENTS_SCHEMA
    ]
})
export class AuthModule { }