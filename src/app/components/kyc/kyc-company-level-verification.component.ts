import { Component, EventEmitter, Input, OnDestroy, Output } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { ErrorService } from '../../services/error.service';
import { Validators, UntypedFormBuilder, AbstractControl } from '@angular/forms';
import { LoginResult, PostAddress, SettingsKyc, UserType } from '../../model/generated-models';
import { Subscription } from 'rxjs';
import { getCountryByCode3 } from '../../model/country-code.model';
import { take } from 'rxjs/operators';
import { getFormattedUtcDate } from 'utils/utils';

@Component({
    selector: 'kyc-company-level-verification',
    templateUrl: 'kyc-company-level-verification.component.html',
    styleUrls: [
        '../../../assets/payment.scss',
        '../../../assets/button.scss',
        '../../../assets/text-control.scss',
        '../../../assets/auth.scss'
    ]
})
export class KycCompanyLevelVerificationComponent implements OnDestroy{
    @Input() buttonTitle = 'SEND';
    @Input() levelName = '';
    @Input() errorMessage = '';
    @Output() error = new EventEmitter<string>();
    @Output() progressChange = new EventEmitter<boolean>();
    @Output() done = new EventEmitter<LoginResult>();

    companyNameControl: AbstractControl | null = null;
    complete = false;
    inProgress = false;

    private subscriptions: Subscription = new Subscription();

    infoForm = this.formBuilder.group({
        companyName: ['', { validators: [], updateOn: 'change' }]
    });

    companyNameErrorMessages: { [key: string]: string; } = {
        ['required']: 'Please specify your company name'
    };

    constructor(
        private auth: AuthService,
        private errorHandler: ErrorService,
        private formBuilder: UntypedFormBuilder) {
        this.companyNameControl = this.infoForm.get('companyName');
    }

    ngOnDestroy(): void {
        this.subscriptions.unsubscribe();
    }

    ngOnInit(): void {
        this.progressChange.emit(false);
        this.setFields();
    }

    private setFields(): void {
        const user = this.auth.user;
        if (user) {
            this.companyNameControl?.setValue(user.companyName);
        } else {
            this.companyNameControl?.setValue('');
        }
        this.companyNameControl?.updateValueAndValidity();
    }

    onSubmit(): void {
        this.error.emit('');
        if (this.infoForm.valid) {
            this.inProgress = true;

            this.subscriptions.add(
                this.auth.companyLevelVerification(
                    this.companyNameControl?.value as string,
                    this.levelName
                ).subscribe(({ data }) => {
                    this.inProgress = false;
                    this.complete = true;
                }, (error) => {
                    this.inProgress = false;
                    this.progressChange.emit(false);
                    this.error.emit(this.errorHandler.getError(error.message, 'Incorrect сщьзфтн data'));
                })
            );
        }
    }
}
