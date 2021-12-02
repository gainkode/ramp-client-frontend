import { AfterViewInit, Component, OnDestroy, OnInit } from '@angular/core';
import { AbstractControl, FormBuilder } from '@angular/forms';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { AuthService } from 'src/app/services/auth.service';
import { ErrorService } from 'src/app/services/error.service';
import { ProfileDataService } from 'src/app/services/profile.service';

@Component({
    selector: 'app-personal-security-settings',
    templateUrl: './security.component.html',
    styleUrls: [
        '../../../../../assets/menu.scss',
        '../../../../../assets/button.scss',
        '../../../../../assets/text-control.scss',
        '../../../../../assets/profile.scss'
    ]
})
export class PersonalSecuriySettingsComponent implements OnInit, OnDestroy, AfterViewInit {
    private subscriptions: Subscription = new Subscription();

    twoFaForm = this.formBuilder.group({
        switch: [false]
    });
    passwordForm = this.formBuilder.group({
        password1: [''],
        password2: [''],
        password3: ['']
    });

    get twoFaField(): AbstractControl | null {
        return this.twoFaForm.get('switch');
    }

    constructor(
        private auth: AuthService,
        private errorHandler: ErrorService,
        private profileService: ProfileDataService,
        private formBuilder: FormBuilder,
        private router: Router) {
    }

    ngOnInit(): void {
        this.subscriptions.add(
            this.twoFaField?.valueChanges.subscribe(val => {
                
            }));
    }

    ngOnDestroy(): void {

    }

    ngAfterViewInit(): void {

    }
}
