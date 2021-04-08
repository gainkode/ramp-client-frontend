import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { SettingsCurrencyListResult, TransactionType, User } from '../model/generated-models';
import { QuickCheckoutDataService } from '../services/quick-checkout.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { WalletValidator } from '../utils/wallet.validator';
import { ErrorService } from '../services/error.service';
import { CurrencyView, QuickCheckoutTransactionTypeList } from '../model/payment.model';

//const WAValidator = require('multicoin-address-validator');

@Component({
    templateUrl: 'quick-checkout.component.html',
    styleUrls: ['quick-checkout.scss']
})
export class QuuckCheckoutComponent implements OnInit {
    user: User | null = null;
    errorMessage = '';
    inProgress = false;
    walletAddressName = '';
    private _settingsSubscription!: any;
    sourceCurrencies: CurrencyView[] = [];
    destinationCurrencies: CurrencyView[] = [];
    transactionList = QuickCheckoutTransactionTypeList;

    numberPattern = /^[+-]?((\.\d+)|(\d+(\.\d+)?))$/;
    secondFormGroup!: FormGroup;
    detailsForm = this.formBuilder.group({
        email: ['', {
            validators: [
                Validators.required,
                Validators.pattern('^[a-zA-Z0-9_.+\-]+@[a-zA-Z0-9\-]+\.[a-zA-Z0-9\-\.]+$')
            ], updateOn: 'change'
        }],
        amountFrom: ['200', { validators: [
            Validators.required,
            Validators.pattern(this.numberPattern)
        ], updateOn: 'change' }],
        currencyFrom: ['', { validators: [Validators.required], updateOn: 'change' }],
        amountTo: ['0', { validators: [
            Validators.required,
            Validators.pattern(this.numberPattern)
        ], updateOn: 'change' }],
        currencyTo: ['', { validators: [Validators.required], updateOn: 'change' }],
        address: ['', { validators: [Validators.required], updateOn: 'change' }],
        transaction: [TransactionType.Deposit, { validators: [Validators.required], updateOn: 'change' }]
    }, {
        validators: [WalletValidator.addressValidator('address', 'currencyTo')], updateOn: 'change'
    });

    constructor(private auth: AuthService, private dataService: QuickCheckoutDataService,
        private errorHandler: ErrorService, private formBuilder: FormBuilder, private router: Router) {
        this.user = auth.user;
    }

    ngOnInit(): void {
        this.detailsForm.get('currencyTo')?.valueChanges.subscribe((val) => {
            this.walletAddressName = `${val} wallet address`;
        });
        const currencyData = this.dataService.getSettingsCurrency();
        if (currencyData === null) {
            this.errorMessage = this.errorHandler.getRejectedCookieMessage();;
        } else {
            this.inProgress = true;
            this._settingsSubscription = currencyData.valueChanges.subscribe(({ data }) => {
                const currencySettings = data.getSettingsCurrency as SettingsCurrencyListResult;
                let itemCount = 0;
                if (currencySettings !== null) {
                    itemCount = currencySettings?.count as number;
                    if (itemCount > 0) {
                        this.sourceCurrencies = currencySettings?.list?.filter(c => {
                            return (c.symbol !== 'BTC' && c.symbol !== 'USDC');
                        }).map((val) => {
                            const c = new CurrencyView();
                            c.id = val.symbol;
                            c.name = val.symbol;
                            return c;
                        }) as CurrencyView[];
                        this.destinationCurrencies = currencySettings?.list?.filter(c => {
                            return (c.symbol !== 'EUR' && c.symbol !== 'USDC');
                        }).map((val) => {
                            const c = new CurrencyView();
                            c.id = val.symbol;
                            c.name = val.symbol;
                            return c;
                        }) as CurrencyView[];
                        if (this.sourceCurrencies.length > 0) {
                            this.detailsForm.get('currencyFrom')?.setValue(this.sourceCurrencies[0].id);
                        }
                        if (this.destinationCurrencies.length > 0) {
                            this.detailsForm.get('currencyTo')?.setValue(this.destinationCurrencies[0].id);
                        }
                    }
                }
                this.inProgress = false;
            }, (error) => {
                this.inProgress = false;
                if (this.auth.token !== '') {
                    this.errorMessage = this.errorHandler.getError(error.message, 'Unable to load fee settings');
                } else {
                    this.router.navigateByUrl('/');
                }
            });
        }
        this.secondFormGroup = this.formBuilder.group({
            secondCtrl: ['', Validators.required]
        });
    }
}
