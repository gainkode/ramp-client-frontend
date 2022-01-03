import { Component, EventEmitter, Input, OnDestroy, OnInit, Output, ViewChild } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { ErrorService } from '../../services/error.service';
import { Validators, FormBuilder, AbstractControl } from '@angular/forms';
import { LoginResult, UserType } from '../../model/generated-models';
import { SignupInfoPanelComponent } from './signup-info.component';
import { Subscription } from 'rxjs';

@Component({
    selector: 'app-signup-panel',
    templateUrl: 'signup-panel.component.html',
    styleUrls: [
        '../../../assets/button.scss',
        '../../../assets/text-control.scss',
        '../../../assets/auth.scss',
        '../../../assets/payment.scss'
    ]
})
export class SignUpPanelComponent implements OnInit, OnDestroy {
    @Input() set userName(val: string) {
        this.emailField?.setValue(val);
    }
    @Input() userType: UserType = UserType.Personal;
    @Input() errorMessage = '';
    @Input() wizardButtons = false;
    @Output() error = new EventEmitter<string>();
    @Output() progressChange = new EventEmitter<boolean>();
    @Output() onBack = new EventEmitter();
    @Output() registered = new EventEmitter<string>();
    @ViewChild('signupInfo') set signupInfo(panel: SignupInfoPanelComponent) {
        if (panel) {
            this.signupInfoPanel = panel;
            panel.init();
        }
    }

    extraData = false;
    validData = false;
    userTypeSection = 'personal';

    signupForm = this.formBuilder.group({
        email: ['',
            {
                validators: [
                    Validators.required,
                    Validators.pattern('^[a-zA-Z0-9_.+\-]+@[a-zA-Z0-9\-]+\.[a-zA-Z0-9\-\.]+$')
                ], updateOn: 'change'
            }
        ],
        password1: [,
            {
                validators: [
                    Validators.required,
                    Validators.minLength(8),
                    Validators.pattern('(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[`~$@#!%^_*?&+=<|>])[A-Za-z0-9\d`~$@#!%^_*?&+=<|>].{7,30}')
                ], updateOn: 'change'
            }
        ],
        password2: [,
            {
                validators: [
                    Validators.required,
                    Validators.minLength(8)
                ], updateOn: 'change'
            }
        ],
        agreement: [false]
    });

    emailErrorMessages: { [key: string]: string; } = {
        ['pattern']: 'Email is not valid',
        ['required']: 'Email is required'
    };
    password1ErrorMessages: { [key: string]: string; } = {
        ['required']: 'Please specify your password',
        ['minlength']: 'Password must contain at least 8 symbols',
        ['pattern']: 'Invalid password format'
    };
    password2ErrorMessages: { [key: string]: string; } = {
        ['required']: 'Please specify your password',
        ['minlength']: 'Password must contain at least 8 symbols'
    };

    private signupInfoPanel!: SignupInfoPanelComponent;
    private subscriptions: Subscription = new Subscription();

    private validateForm(): void {
        this.validData = (this.emailField?.valid ?? false) &&
            (this.signupForm.get('password1')?.valid ?? false) &&
            (this.signupForm.get('password2')?.valid ?? false) &&
            (this.signupForm.get('agreement')?.value === true);
    }

    constructor(
        private auth: AuthService,
        private errorHandler: ErrorService,
        private formBuilder: FormBuilder) { }

    ngOnInit(): void {
        if (this.userType === UserType.Merchant) {
            this.userTypeSection = 'merchant';
        }
        this.subscriptions.add(this.emailField?.valueChanges.subscribe(val => {
            this.validateForm();
        }));
        this.subscriptions.add(this.signupForm.get('password1')?.valueChanges.subscribe(val => {
            this.validateForm();
        }));
        this.subscriptions.add(this.signupForm.get('password2')?.valueChanges.subscribe(val => {
            this.validateForm();
        }));
        this.subscriptions.add(this.signupForm.get('agreement')?.valueChanges.subscribe(val => {
            this.validateForm();
        }));
    }

    ngOnDestroy(): void {
        this.subscriptions.unsubscribe();
    }

    get emailField(): AbstractControl | null {
        return this.signupForm.get('email');
    }

    passwordsEqual(): boolean {
        const p1 = this.signupForm.get('password1')?.value;
        const p2 = this.signupForm.get('password2')?.value;
        return (p1 === p2);
    }

    onSubmit(): void {
        this.registerError('');
        if (this.signupForm.valid) {
            if (!this.passwordsEqual()) {
                this.registerError('Passwords are not equal');
                return;
            }
            this.progressChange.emit(true);
            this.registerAccount(this.emailField?.value, this.signupForm.get('password1')?.value);
        }
    }

    registerAccount(email: string, password: string): void {
        this.subscriptions.add(
            this.auth.register(email, password, this.userType).subscribe((signupData) => {
                const userData = signupData.data.signup as LoginResult;
                if (!userData.authTokenAction) {
                    this.progressChange.emit(false);
                    this.registered.emit(email);
                } else if (userData.authTokenAction === 'UserInfoRequired') {
                    this.showSignupPanel(userData);
                } else {
                    this.progressChange.emit(false);
                    this.registerError('Unable to recognize the registration action');
                    console.error('Unable to recognize the registration action', userData.authTokenAction);
                }
            }, (error) => {
                this.progressChange.emit(false);
                this.registerError(this.errorHandler.getError(error.message, 'Unable to register new account'));
            })
        );
    }

    showSignupPanel(userData: LoginResult): void {
        this.auth.setLoginUser(userData);
        const signupPanelReady = (this.signupInfoPanel) ? true : false;
        this.extraData = true;
        if (signupPanelReady) {
            this.signupInfoPanel.init();
        }
    }

    registerError(error: string): void {
        this.error.emit(error);
    }

    onSignupProgress(visible: boolean): void {
        this.progressChange.emit(visible);
    }

    onSignupDone(userData: LoginResult): void {
        if (!userData.authTokenAction ||
            userData.authTokenAction === 'Default' ||
            userData.authTokenAction === 'KycRequired') {
            this.registered.emit(userData?.user?.email);
        } else {
            console.error('onSignupDone. Wrong token action:', userData.authTokenAction);
            this.registerError('Unable to update personal data');
        }
    }
}
