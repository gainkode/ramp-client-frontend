import { AfterViewInit, Component, EventEmitter, OnDestroy, Output } from '@angular/core';
import { Router } from '@angular/router';
import { TierItem } from 'src/app/model/identification.model';
import { AuthService } from 'src/app/services/auth.service';
import { ErrorService } from 'src/app/services/error.service';
import { ProfileDataService } from 'src/app/services/profile.service';

@Component({
    selector: 'app-profile-verification-settings',
    templateUrl: './verification.component.html',
    styleUrls: ['../../../../assets/menu.scss', '../../../../assets/button.scss', '../../../../assets/profile.scss']
})
export class ProfileVerificationSettingsComponent implements OnDestroy, AfterViewInit {
    @Output() error = new EventEmitter<string>();
    @Output() progressChange = new EventEmitter<boolean>();

    tiers: TierItem[] = [];

    constructor(
        private auth: AuthService,
        private errorHandler: ErrorService,
        private profileService: ProfileDataService,
        private router: Router) {
    }

    ngOnDestroy(): void {

    }

    ngAfterViewInit(): void {
        this.tiers.push({
            id: 'entry_tier',
            name: 'Entry Tier',
            limit: 'FIAT 1.000',
            subtitle: 'Crypto Unlimited',
            description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.',
            passed: true,
            current: false
        } as TierItem);
        this.tiers.push({
            id: 'mid_tier',
            name: 'Mid Tier',
            limit: 'FIAT 10.000',
            subtitle: 'Crypto Unlimited',
            description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.',
            passed: false,
            current: true
        } as TierItem);
        this.tiers.push({
            id: 'pro_tier',
            name: 'Pro Tier',
            limit: 'FIAT 1.000.000',
            subtitle: 'Crypto Unlimited',
            description: 'Lorem ipsum dolor sit amet',
            passed: false,
            current: false
        } as TierItem);
    }

    onVerify(id: string): void {
        console.log(id);
    }
}
