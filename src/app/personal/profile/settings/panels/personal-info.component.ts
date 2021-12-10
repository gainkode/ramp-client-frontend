import { AfterViewInit, Component, EventEmitter, OnDestroy, OnInit, Output } from '@angular/core';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { User, UserInput } from 'src/app/model/generated-models';
import { UserItem } from 'src/app/model/user.model';
import { AuthService } from 'src/app/services/auth.service';
import { ErrorService } from 'src/app/services/error.service';
import { ProfileDataService } from 'src/app/services/profile.service';

@Component({
    selector: 'app-personal-info-settings',
    templateUrl: './personal-info.component.html',
    styleUrls: ['../../../../../assets/menu.scss', '../../../../../assets/button.scss', '../../../../../assets/profile.scss']
})
export class PersonalInfoSettingsComponent implements OnInit, OnDestroy {
    @Output() error = new EventEmitter<string>();
    @Output() progressChange = new EventEmitter<boolean>();

    user!: User;
    userView: UserItem = new UserItem(null);

    private subscriptions: Subscription = new Subscription();

    constructor(
        private auth: AuthService,
        private errorHandler: ErrorService,
        private profileService: ProfileDataService,
        private router: Router) {
    }

    ngOnDestroy(): void {
        this.subscriptions.unsubscribe();
    }

    ngOnInit(): void {
        this.loadAccountData();
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
                    if (data) {
                        const userData = data.me as User;
                        if (userData) {
                            this.user = userData;
                            this.userView = new UserItem(this.user);
                        }
                    } else {
                        this.router.navigateByUrl('/');
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

    private setUserData(vars: UserInput): void {
        this.error.emit('');
        this.progressChange.emit(true);
        this.subscriptions.add(
            this.profileService.saveUserInfo(vars).subscribe(({ data }) => {
                this.progressChange.emit(false);
                const resultData = data.updateMe as User;
                if (!resultData) {
                    this.error.emit('Unable to save user data');
                } else {
                    this.user = resultData;
                    this.auth.setUser(resultData);
                }
            }, (error) => {
                this.progressChange.emit(false);
                this.error.emit(this.errorHandler.getError(error.message, 'Unable to save user data'));
            })
        );
    }

    private getCurrentUserData(): UserInput {
        const result = {
            firstName: this.user.firstName ?? undefined,
            lastName: this.user.lastName ?? undefined,
            countryCode2: this.user.countryCode2 ?? undefined,
            countryCode3: this.user.countryCode3 ?? undefined,
            birthday: this.user.birthday ?? undefined,
            phone: this.user.phone ?? undefined,
            postCode: this.user.postCode ?? undefined,
            town: this.user.town ?? undefined,
            street: this.user.street ?? undefined,
            subStreet: this.user.subStreet ?? undefined,
            stateName: this.user.stateName ?? undefined,
            buildingName: this.user.buildingName ?? undefined,
            buildingNumber: this.user.buildingNumber ?? undefined,
            flatNumber: this.user.flatNumber ?? undefined,
            avatar: this.user.avatar ?? undefined,
            defaultFiatCurrency: this.user.defaultFiatCurrency ?? undefined,
            defaultCryptoCurrency: this.user.defaultCryptoCurrency ?? undefined
        } as UserInput;
        this.auth.setUserName
        return result;
    }

    verifyKyc(): void {
        this.router.navigateByUrl(`${this.auth.getUserAccountPage()}/settings/verification`).then(() => {
            window.location.reload();
        });
    }

    setAvatar(): void {

    }

    changeFirstName(data: string): void {
        const vars = this.getCurrentUserData();
        vars.firstName = data;
        this.setUserData(vars);
    }

    changeLastName(data: string): void {
        const vars = this.getCurrentUserData();
        vars.lastName = data;
        this.setUserData(vars);
    }
}
