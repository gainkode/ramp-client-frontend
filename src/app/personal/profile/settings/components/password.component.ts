import { Component, EventEmitter, Input, OnDestroy, Output, ViewChild } from '@angular/core';
import { AbstractControl, FormBuilder, NgForm, Validators } from '@angular/forms';
import { Subscription } from 'rxjs';
import { ErrorService } from 'src/app/services/error.service';
import { ProfileDataService } from 'src/app/services/profile.service';
import { PasswordValidator } from 'src/app/utils/password.validator';

@Component({
    selector: 'app-profile-change-password',
    templateUrl: './password.component.html',
    styleUrls: [
        '../../../../../assets/menu.scss',
        '../../../../../assets/button.scss',
        '../../../../../assets/text-control.scss',
        '../../../../../assets/profile.scss'
    ]
})
export class PersonalChangePasswordComponent implements OnDestroy {
    @ViewChild('passwordform') private ngPasswordForm: NgForm | undefined = undefined;
    @Input() twoFaRequired = false;
    @Output() error = new EventEmitter<string>();
    @Output() progressChange = new EventEmitter<boolean>();

    twoFaCode = '';

    private subscriptions: Subscription = new Subscription();

    passwordForm = this.formBuilder.group({
        currentPassword: [
            '',
            { validators: [Validators.required], updateOn: 'change' },
        ],
        newPassword: [
            '',
            {
                validators: [
                    Validators.required,
                    Validators.minLength(8),
                    Validators.pattern('(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[`~$@#!%^_*?&+=<|>])[A-Za-z0-9\d`~$@#!%^_*?&+=<|>].{7,30}')
                ], updateOn: 'change'
            },
        ],
        confirmPassword: [
            '',
            {
                validators: [
                    Validators.required,
                    Validators.minLength(8),
                    Validators.pattern('(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[`~$@#!%^_*?&+=<|>])[A-Za-z0-9\d`~$@#!%^_*?&+=<|>].{7,30}')
                ], updateOn: 'change'
            },
        ]
    }, {
        validators: [
            PasswordValidator.equalityValidator('newPassword', 'confirmPassword'),
        ],
        updateOn: 'change',
    });

    get currentPasswordField(): AbstractControl | null {
        return this.passwordForm.get('currentPassword');
    }

    get newPasswordField(): AbstractControl | null {
        return this.passwordForm.get('newPassword');
    }

    get confirmPasswordField(): AbstractControl | null {
        return this.passwordForm.get('confirmPassword');
    }

    passwordErrorMessages: { [key: string]: string; } = {
        ['required']: 'Password is required',
        ['minlength']: 'Password must contain at least 8 symbols',
        ['pattern']: 'Password is not hard enough'
    };

    constructor(
        private errorHandler: ErrorService,
        private profileService: ProfileDataService,
        private formBuilder: FormBuilder) {
    }

    ngOnDestroy(): void {
        this.subscriptions.unsubscribe();
    }

    private savePassword(): void {
        if (this.passwordForm.valid) {
            this.error.emit('');
            this.progressChange.emit(true);
            this.subscriptions.add(
                this.profileService.changePassword(
                    this.twoFaCode,
                    this.currentPasswordField?.value,
                    this.newPasswordField?.value
                ).subscribe(({ data }) => {
                    this.progressChange.emit(false);
                    const resultData = data.changePassword as boolean;
                    if (resultData) {
                        this.ngPasswordForm?.resetForm();
                        //this.showSuccessMessageDialog();
                    } else {
                        this.error.emit('Password is not changed');
                    }
                }, (error) => {
                    this.progressChange.emit(false);
                    this.error.emit(this.errorHandler.getError(error.message, 'Unable to change a password'));
                })
            );
        }
    }

    onSubmit(): void {
        if (this.twoFaRequired) {
            // show dialog
        } else {
            this.savePassword();
        }
    }
}
