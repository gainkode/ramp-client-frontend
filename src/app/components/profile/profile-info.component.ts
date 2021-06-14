import { Component, Input } from '@angular/core';
import { Validators, FormBuilder } from '@angular/forms';
import { Router } from '@angular/router';
import { User } from 'src/app/model/generated-models';
import { AuthService } from 'src/app/services/auth.service';
import { ErrorService } from 'src/app/services/error.service';
import { ProfileDataService } from 'src/app/services/profile.service';

@Component({
    selector: 'app-info',
    templateUrl: './profile-info.component.html'
})
export class ProfileInfoComponent {
    @Input()
    set user(data: User | null) {
        this._user = data as User;
        this.loadForm();
    }
    private _user!: User;
    inProgress = false;
    errorMessage = '';

    userForm = this.formBuilder.group({
        id: [''],
        userName: ['', { validators: [Validators.required], updateOn: 'change' }],
        address: ['', { validators: [Validators.required], updateOn: 'change' }],
        country: ['', { validators: [Validators.required], updateOn: 'change' }],
        email: [''],
        phone: ['', { validators: [Validators.required], updateOn: 'change' }],
        currency: ['', { validators: [Validators.required], updateOn: 'change' }]
    });

    constructor(private auth: AuthService, private profile: ProfileDataService,
        private errorHandler: ErrorService, private formBuilder: FormBuilder, private router: Router) { }

    ngOnInit(): void {
        this.loadForm();
    }

    loadForm(): void {
        this.userForm.get('id')?.setValue(this._user?.userId);
        this.userForm.get('userName')?.setValue(this._user?.name);
        this.userForm.get('address')?.setValue('');
        this.userForm.get('country')?.setValue(this._user?.countryCode3);
        this.userForm.get('email')?.setValue(this._user?.email);
        this.userForm.get('phone')?.setValue(this._user?.phone);
        this.userForm.get('currency')?.setValue(this._user?.defaultCurrency);
    }
}