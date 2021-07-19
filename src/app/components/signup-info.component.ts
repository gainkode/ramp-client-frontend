import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { ErrorService } from '../services/error.service';
import { Validators, FormBuilder } from '@angular/forms';
import { LoginResult, SettingsKyc, UserMode } from '../model/generated-models';
import { Subscription } from 'rxjs';

@Component({
    selector: 'app-signup-info-panel',
    templateUrl: 'signup-info.component.html'
})
export class SignupInfoPanelComponent implements OnDestroy {
    @Input() buttonTitle = 'OK';
    @Output() error = new EventEmitter<string>();
    @Output() progressChange = new EventEmitter<boolean>();
    @Output() done = new EventEmitter<string>();

    private pSettingsSubscription!: any;

    infoForm = this.formBuilder.group({
        fullName: ['', { validators: [Validators.required], updateOn: 'change' }],
        phoneCode: ['',
            {
                validators: [
                    Validators.required,
                    Validators.pattern('^[\+](?:[0-9]?){0,3}[0-9]$')
                ], updateOn: 'change'
            }
        ],
        phoneNumber: ['',
            {
                validators: [
                    Validators.required,
                    Validators.pattern('^(?:[0-9]?){6,9}[0-9]$')
                ], updateOn: 'change'
            }
        ],
        birthday: ['', { validators: [Validators.required], updateOn: 'change' }],
        address: ['', { validators: [Validators.required], updateOn: 'change' }],
        flatNumber: ['', { validators: [Validators.required], updateOn: 'change' }]
    });

    constructor(private auth: AuthService, private errorHandler: ErrorService,
        private formBuilder: FormBuilder) { }

    ngOnDestroy(): void {
        const s: Subscription = this.pSettingsSubscription;
        if (s !== undefined) {
            (this.pSettingsSubscription as Subscription).unsubscribe();
        }
    }

    init(): void {
        const fieldsData = this.auth.getSignupRequiredFields();
        if (fieldsData === null) {
            this.error.emit(this.errorHandler.getRejectedCookieMessage());
        } else {
            this.progressChange.emit(true);
            this.pSettingsSubscription = fieldsData.valueChanges.subscribe(({ data }) => {
                const fields: SettingsKyc = data.mySettingsKycFull;
                console.log(fields);
                this.progressChange.emit(false);
            }, (error) => {
                this.progressChange.emit(false);
            });
        }
    }

    onSubmit(): void {
        this.error.emit('');
        if (this.infoForm.valid) {
            // this.progressChange.emit(true);
            // const login = this.infoForm.get('email')?.value;
            // this.auth.authenticate(login, this.loginForm.get('password')?.value).subscribe(({ data }) => {
            //     const userData = data.login as LoginResult;
            //     this.progressChange.emit(false);
            //     if (userData.user?.mode === UserMode.InternalWallet) {
            //         if (userData.authTokenAction === 'TwoFactorAuth') {
            //             this.twoFa = true;
            //             this.twoFaToken = userData.authToken as string;
            //         } else {
            //             this.authenticated.emit(userData);
            //         }
            //     } else {
            //         this.error.emit(`Unable to authorise with the login "${login}". Please sign up`);
            //     }
            // }, (error) => {
            //     this.progressChange.emit(false);
            //     this.error.emit(this.errorHandler.getError(error.message, 'Incorrect login or password'));
            // });
        }
    }
}
