import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { AbstractControl, FormBuilder, Validators } from '@angular/forms';
import { Subscription } from 'rxjs';
import { LoginResult } from 'src/app/model/generated-models';
import { AuthService } from 'src/app/services/auth.service';
import { ErrorService } from 'src/app/services/error.service';

@Component({
    selector: 'app-widget-identification',
    templateUrl: 'identification.component.html',
    styleUrls: ['../../../assets/payment.scss', '../../../assets/button.scss']
})
export class WidgetidentificationComponent implements OnInit, OnDestroy {
    @Input() email = '';
    @Output() onError = new EventEmitter<string>();
    @Output() onProgress = new EventEmitter<boolean>();
    @Output() onBack = new EventEmitter();
    @Output() onRegister = new EventEmitter<string>();
    @Output() onComplete = new EventEmitter<LoginResult>();
    @Output() onAlreadyAuthenticated = new EventEmitter();
    @Output() onLoginRequired = new EventEmitter<string>();
    @Output() onConfirmRequired = new EventEmitter<string>();

    private pSubscriptions: Subscription = new Subscription();

    validData = false;
    init = false;
    register = false;
    emailErrorMessages: { [key: string]: string; } = {
        ['pattern']: 'Email is not valid',
        ['required']: 'Email is required'
    };

    dataForm = this.formBuilder.group({
        email: ['',
            {
                validators: [
                    Validators.required,
                    Validators.pattern('^[a-zA-Z0-9_.+\-]+@[a-zA-Z0-9\-]+\.[a-zA-Z0-9\-\.]+$')
                ], updateOn: 'change'
            }
        ]
    });

    get emailField(): AbstractControl | null {
        return this.dataForm.get('email');
    }

    constructor(
        private formBuilder: FormBuilder,
        private errorHandler: ErrorService,
        private auth: AuthService) { }

    ngOnInit(): void {
        this.pSubscriptions.add(this.emailField?.valueChanges.subscribe(val => this.onEmailUpdated(val)));
        this.emailField?.setValue(this.email);
    }

    ngOnDestroy(): void {
        this.pSubscriptions.unsubscribe();
    }

    onSubmit(): void {
        const emailValue = this.emailField?.value;
        if (this.register) {
            this.onRegister.emit(emailValue);
        } else {
            if (this.dataForm.valid) {
                const authEmail = this.auth.user?.email ?? '';
                if (authEmail === emailValue && this.emailField?.valid) {
                    this.onAlreadyAuthenticated.emit();
                } else {
                    this.auth.logout();
                    this.onProgress.emit(true);
                    // Consider that the user is one-time wallet user rather than internal one
                    this.pSubscriptions.add(
                        this.auth.authenticate(emailValue, '', true).subscribe(({ data }) => {
                            this.onProgress.emit(false);
                            this.onComplete.emit(data.login as LoginResult);
                        }, (error) => {
                            this.onProgress.emit(false);
                            if (this.errorHandler.getCurrentError() === 'auth.password_null_or_empty') {
                                // Internal user cannot be authorised without a password, so need to
                                //  show the authorisation form to fill
                                this.onLoginRequired.emit(emailValue);
                            } else if (this.errorHandler.getCurrentError() === 'auth.unconfirmed_email') {
                                // User has to confirm email verifying the code
                                this.onConfirmRequired.emit(emailValue);
                            } else {
                                this.onError.emit(this.errorHandler.getError(error.message, 'Unable to authenticate user'));
                            }
                        })
                    );
                }
            }
        }
    }

    private onEmailUpdated(val: string): void {
        this.init = true;
        this.validData = this.emailField?.valid ?? false;
    }
}
