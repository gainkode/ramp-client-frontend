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

    private pSubscriptions: Subscription = new Subscription();

    errorMessage = '';
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
        if (this.register) {
            this.onRegister.emit(this.emailField?.value);
        } else {
            this.pSubscriptions.add(
                // this.auth.confirmCode(code).subscribe(({ data }) => {
                //     this.login();
                // }, (error) => {
                //     this.errorMessage = this.errorHandler.getError(error.message, 'Incorrect confirmation code');
                //     this.onError.emit(this.errorMessage);
                // })
            );
        }
    }

    private onEmailUpdated(val: string): void {
        this.init = true;
        this.validData = this.emailField?.valid ?? false;
    }
}
