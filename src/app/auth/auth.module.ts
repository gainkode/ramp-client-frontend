import { NgModule } from "@angular/core";
import { CommonModule } from '@angular/common';
import { FormsModule } from "@angular/forms";
import { RouterModule } from "@angular/router";
import { AuthComponent } from "./auth.component";
import { LoginComponent } from "./login.component";
import { RegisterComponent } from "./register.component";

const routing = RouterModule.forChild([
    { path: "login", component: LoginComponent },
    { path: 'register', component: RegisterComponent },
    { path: "**", redirectTo: "login" }
]);

@NgModule({
    imports: [
        CommonModule, FormsModule, routing
    ],
    declarations: [LoginComponent, RegisterComponent]
})
export class AuthModule { }