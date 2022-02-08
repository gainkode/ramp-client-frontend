import { Component, EventEmitter, OnDestroy, OnInit, Output } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { take } from 'rxjs/operators';
import { SumsubVerificationDialogBox } from 'src/app/components/dialogs/sumsub-verification.dialog';
import { SettingsKycTierListResult, SettingsKycTierShortExListResult, UserState } from 'src/app/model/generated-models';
import { TierItem } from 'src/app/model/identification.model';
import { AuthService } from 'src/app/services/auth.service';
import { CommonDataService } from 'src/app/services/common-data.service';
import { ErrorService } from 'src/app/services/error.service';
import { PaymentDataService } from 'src/app/services/payment.service';

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

    private pSubscriptions: Subscription = new Subscription();

    constructor(
        private auth: AuthService,
        private errorHandler: ErrorService,
        private dataService: PaymentDataService,
        private commonService: CommonDataService,
        private router: Router,
        public dialog: MatDialog) {
    }

    ngOnInit(): void {
        this.loadTransactionsTotal();
    }

    ngOnDestroy(): void {
        this.pSubscriptions.unsubscribe();
    }

    onVerify(flow: string, level: string): void {
        this.dialog.open(SumsubVerificationDialogBox, {
            width: '700px',
            height: '80%',
            data: {
                title: level,
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
        const tiersData = this.dataService.mySettingsKycTiers().valueChanges.pipe(take(1));
        const settingsCommon = this.auth.getLocalSettingsCommon();
        if (settingsCommon === null) {
            this.error.emit('Unable to load common settings');
        } else {
            this.pSubscriptions.add(
                tiersData.subscribe(({ data }) => {
                    const tiersData = data.mySettingsKycTiers as SettingsKycTierShortExListResult;
                    this.progressChange.emit(false);
                    if ((tiersData.count ?? 0 > 0) && tiersData.list) {
                        const rawTiers = [...tiersData.list];
                        const sortedTiers = rawTiers.sort((a, b) => {
                            let aa = a.amount ?? 0;
                            let ba = b.amount ?? 0;
                            if (!a.amount && b.amount) {
                                return 1;
                            }
                            if (a.amount && !b.amount) {
                                return -1;
                            }
                            if (aa > ba) {
                                return 1;
                            }
                            if (aa < ba) {
                                return -1;
                            }
                            return 0;
                        });
                        const currentQuote = this.auth.user?.kycTier?.amount ?? undefined;
                        this.tiers = sortedTiers.map(val => {
                            const defaultDescription = 'Start verification process to increase your limit up to this level.';
                            let tierPassed = true;
                            if (currentQuote) {
                                tierPassed = (val.amount) ? (currentQuote > val.amount) : false;
                            }
                            return {
                                limit: (val.amount) ?
                                    new Intl.NumberFormat('de-DE', {
                                        minimumFractionDigits: 0,
                                        style: 'currency',
                                        currency: 'EUR'
                                    }).format(val.amount ?? 0) :
                                    'Unlimited',
                                name: val.name,
                                passed: tierPassed,
                                subtitle: val.levelName ?? 'Identity',
                                description: val.description ?? defaultDescription,
                                flow: val.originalFlowName ?? ''
                            } as TierItem;
                        });
                    }
                    this.kycUrl = settingsCommon.kycBaseAddress as string;
                }, (error) => {
                    this.progressChange.emit(false);
                    if (this.errorHandler.getCurrentError() === 'auth.token_invalid' || error.message === 'Access denied') {
                        this.router.navigateByUrl('/');
                    } else {
                        this.error.emit(this.errorHandler.getError(error.message, 'Unable to get tiers'));
                    }
                })
            );
        }
    }
}
