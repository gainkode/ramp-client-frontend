import { Component, EventEmitter, OnDestroy, OnInit, Output } from '@angular/core';
import { AbstractControl, FormBuilder } from '@angular/forms';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { User } from 'src/app/model/generated-models';
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
export class PersonalSecuriySettingsComponent implements OnInit, OnDestroy {
    @Output() error = new EventEmitter<string>();
    @Output() progressChange = new EventEmitter<boolean>();

    password2FaRequired = false;
    passwordCanBeChanged = false;
    user!: User;

    private subscriptions: Subscription = new Subscription();

    twoFaForm = this.formBuilder.group({
        switch: [false]
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
        this.loadAccountData();
        this.subscriptions.add(
            this.twoFaField?.valueChanges.subscribe(val => {

            }));
    }

    ngOnDestroy(): void {
        this.subscriptions.unsubscribe();
    }

    private loadAccountData(): void {
        this.error.emit('');
        this.progressChange.emit(true);
        const meQuery = this.profileService.getProfileData();
        if (meQuery === null) {
            this.error.emit(this.errorHandler.getRejectedCookieMessage());
        } else {
            this.subscriptions.add(
                meQuery.valueChanges.subscribe(({ data }) => {
                    const userData = data.me as User;
                    if (userData) {
                        this.user = userData;
                        this.passwordCanBeChanged = this.user.hasEmailAuth as boolean;
                        this.password2FaRequired = this.user.is2faEnabled as boolean;
                    }
                    this.progressChange.emit(false);
                }, (error) => {
                    this.progressChange.emit(false);
                    if (this.auth.token !== '') {
                        this.error.emit(this.errorHandler.getError(error.message, 'Unable to load user data'));
                    } else {
                        this.router.navigateByUrl('/');
                    }
                })
            );
        }
    }
}
