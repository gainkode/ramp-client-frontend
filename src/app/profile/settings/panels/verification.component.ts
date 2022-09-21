import { Component, EventEmitter, OnDestroy, OnInit, Output } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { take } from 'rxjs/operators';
import { KycVerificationDialogBox } from 'src/app/components/dialogs/kyc-verification.dialog';
import { UserState } from 'src/app/model/generated-models';
import { TierItem } from 'src/app/model/identification.model';
import { AuthService } from 'src/app/services/auth.service';
import { CommonDataService } from 'src/app/services/common-data.service';
import { ErrorService } from 'src/app/services/error.service';
import { NotificationService } from 'src/app/services/notification.service';
import { PaymentDataService } from 'src/app/services/payment.service';
import { getTierBlocks } from 'src/app/utils/profile.utils';

@Component({
    selector: 'app-profile-verification-settings',
    templateUrl: './verification.component.html',
    styleUrls: ['../../../../assets/menu.scss', '../../../../assets/button.scss', '../../../../assets/profile.scss']
})
export class ProfileVerificationSettingsComponent implements OnInit, OnDestroy {
    @Output() error = new EventEmitter<string>();
    @Output() progressChange = new EventEmitter<boolean>();

    kycUrl = '';
    total = 0;
    tiers: TierItem[] = [];
    verifiedTierId = '';

    private pSubscriptions: Subscription = new Subscription();

    constructor(
        private auth: AuthService,
        private errorHandler: ErrorService,
        private dataService: PaymentDataService,
        private commonService: CommonDataService,
        private notification: NotificationService,
        private router: Router,
        public dialog: MatDialog) {
    }

    ngOnInit(): void {
        this.startKycNotifications();
        this.loadTransactionsTotal();
    }

    ngOnDestroy(): void {
        this.pSubscriptions.unsubscribe();
    }

    onVerify(flow: string, level: string): void {
        const dialogRef = this.dialog.open(KycVerificationDialogBox, {
            width: '700px',
            height: '80%',
            data: {
                title: '',
                message: this.kycUrl,
                button: flow
            }
        });
    }

    private loadTransactionsTotal(): void {
        this.total = 0;
        const totalData$ = this.commonService.getMyTransactionsTotal().valueChanges.pipe(take(1));
        this.progressChange.emit(true);
        this.pSubscriptions.add(
            totalData$.subscribe(({ data }) => {
                const totalState = data.myState as UserState;
                this.total = totalState.totalAmountEur ?? 0;
                this.getTiers();
            }, (error) => {
                this.progressChange.emit(false);
                this.error.emit(this.errorHandler.getError(error.message, 'Unable to load exchange rate'));
            })
        );
    }

    private getTiers(): void {
        this.error.emit('');
        this.tiers = [];
        const tiersData$ = this.dataService.mySettingsKycTiers(undefined).valueChanges.pipe(take(1));
        const settingsCommon = this.auth.getLocalSettingsCommon();
        if (settingsCommon === null) {
            this.error.emit('Unable to load common settings');
        } else {
            this.pSubscriptions.add(
                tiersData$.subscribe(({ data }) => {
                    this.progressChange.emit(false);
                    if (this.auth.user) {
                        this.tiers = getTierBlocks(this.auth.user, this.verifiedTierId, data.mySettingsKycTiers);
                    }
                    this.kycUrl = settingsCommon.kycBaseAddress as string;
                }, (error) => {
                    this.progressChange.emit(false);
                    if (this.errorHandler.getCurrentError() === 'auth.token_invalid' || error.message === 'Access denied') {
                        this.router.navigateByUrl('/');
                    } else {
                        this.error.emit(this.errorHandler.getError(error.message, 'Unable to get verification levels'));
                    }
                })
            );
        }
    }

    private startKycNotifications(): void {
        this.pSubscriptions.add(
            this.notification.subscribeToKycNotifications().subscribe(
                ({ data }) => {
                    const subscriptionData = data.kycServiceNotification;
                    this.verifiedTierId = subscriptionData.kycTierId;
                    this.getTiers();
                },
                (error) => {
                    console.error('KYC notification error', error);
                }
            )
        );
    }
}
