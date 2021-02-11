import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { Validators, FormBuilder } from '@angular/forms';

@Component({
    templateUrl: 'restore.component.html',
    styleUrls: ['./login.component.scss']
})
export class RestoreComponent {
    inProgress: boolean = false;
    errorMessage: string = '';
    
    restoreForm = this.formBuilder.group({
        email: [, 
            { validators: [
                Validators.required,
                Validators.pattern('^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+.[a-zA-Z0-9-.]+$')
            ], updateOn: "change" }
        ]
    });

    constructor(private auth: AuthService, private formBuilder: FormBuilder, private router: Router) { }
    
    onSubmit() {
        if (this.restoreForm.valid) {
            this.inProgress = true;
            this.auth.forgotPassword(
                this.restoreForm.get('email')?.value)
                .subscribe(({ data }) => {
                    this.inProgress = false;
                    this.router.navigateByUrl("/auth/success/restore");
                },(error) => {
                    this.inProgress = false;
                    this.errorMessage = 'Unable to restore password';
                });
        }
    }
}
