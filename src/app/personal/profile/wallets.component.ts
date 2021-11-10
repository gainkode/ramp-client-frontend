import { ChangeDetectorRef, Component, EventEmitter, OnDestroy, OnInit, Output, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { ProfileBaseFilter, WalletsFilter } from 'src/app/model/filter.model';
import { SettingsCurrencyWithDefaults } from 'src/app/model/generated-models';
import { CurrencyView } from 'src/app/model/payment.model';
import { ProfileItemContainer } from 'src/app/model/profile-item.model';
import { AuthService } from 'src/app/services/auth.service';
import { CommonDataService } from 'src/app/services/common-data.service';
import { ErrorService } from 'src/app/services/error.service';
import { PersonalWalletListComponent } from './data/wallet-list.component';

@Component({
    selector: 'app-personal-wallets',
    templateUrl: './wallets.component.html',
    styleUrls: ['../../../assets/profile.scss']
})
export class PersonalWalletsComponent implements OnInit, OnDestroy {
    @Output() onShowDetails = new EventEmitter<ProfileItemContainer>();
    private dataListPanel!: PersonalWalletListComponent;
    @ViewChild('datalist') set dataList(panel: PersonalWalletListComponent) {
        if (panel) {
            this.dataListPanel = panel;
            this.dataListPanel.load(this.filter);
        }
    }

    inProgress = false;
    inProgressFilter = false;
    errorMessage = '';
    filter = new WalletsFilter();
    cryptoList: CurrencyView[] = [];

    private subscriptions: Subscription = new Subscription();

    constructor(
        private changeDetector: ChangeDetectorRef,
        private activeRoute: ActivatedRoute,
        private auth: AuthService,
        private commonService: CommonDataService,
        private errorHandler: ErrorService,
        private router: Router) {
        this.filter.setData({
            currencies: this.activeRoute.snapshot.params['currencies'],
            balance: this.activeRoute.snapshot.params['balance']
        });
    }

    ngOnInit(): void {
        this.loadCurrencyData();
    }

    ngOnDestroy(): void {
        this.subscriptions.unsubscribe();
    }

    private loadCurrencyData(): void {
        this.cryptoList = [];
        this.inProgressFilter = true;
        const currencyData = this.commonService.getSettingsCurrency();
        if (currencyData === null) {
            this.errorMessage = this.errorHandler.getRejectedCookieMessage();
        } else {
            this.subscriptions.add(
                currencyData.valueChanges.subscribe(({ data }) => {
                    this.inProgressFilter = false;
                    const currencySettings = data.getSettingsCurrency as SettingsCurrencyWithDefaults;
                    if (currencySettings.settingsCurrency) {
                        if (currencySettings.settingsCurrency.count ?? 0 > 0) {
                            this.cryptoList = currencySettings.settingsCurrency.list?.
                                filter(x => x.fiat === false).
                                map((val) => new CurrencyView(val)) as CurrencyView[];
                        }
                    }
                }, (error) => {
                    this.inProgressFilter = false;
                    if (this.auth.token !== '') {
                        this.errorMessage = this.errorHandler.getError(error.message, 'Unable to load currency data');
                    } else {
                        this.router.navigateByUrl('/');
                    }
                })
            );
        }
    }

    onFilterUpdate(filter: ProfileBaseFilter): void {
        this.router.navigateByUrl('/', { skipLocationChange: true }).then(() =>
            this.router.navigate([
                `${this.auth.getUserMainPage()}/wallets`,
                filter.getParameters()
            ])
        );
    }

    handleError(val: string): void {
        this.errorMessage = val;
        this.changeDetector.detectChanges();
    }

    progressChanged(visible: boolean): void {
        this.inProgress = visible;
        this.changeDetector.detectChanges();
    }

    showDetails(details: ProfileItemContainer): void {
        this.onShowDetails.emit(details);
    }
}
