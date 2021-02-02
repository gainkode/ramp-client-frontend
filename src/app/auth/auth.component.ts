import { Component } from "@angular/core";
import { NgForm } from "@angular/forms";
import { Router } from "@angular/router";
import { AuthService } from "../services/auth.service";

@Component({
    templateUrl: "auth.component.html"
})

export class AuthComponent {
    public username: string = "";
    public password: string = "";
    public errorMessage: string | null = null;

    constructor(private router: Router, private auth: AuthService) { }

    authenticate(form: NgForm) {
        if (form.valid) {
            // this.auth.authenticate(this.username, this.password)
            // .subscribe(response => {
            //     if (response) {
            //         this.router.navigateByUrl("/catalog");
            //     }
            //     this.errorMessage = "Wrong login or password";
            // })
            let auth = this.auth.authenticate(this.username, this.password);
            if (auth) {
                this.router.navigateByUrl("/catalog");
            }
            else {
                this.errorMessage = "Wrong login or password";
            }
        } else {
            this.errorMessage = "Data input has wrong format";
        }
    }
}