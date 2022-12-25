import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { concat, Observable, of, Subject, Subscription } from 'rxjs';
import { debounceTime, distinctUntilChanged, filter, map, switchMap, take, tap } from 'rxjs/operators';
import { Filter } from 'src/app/admin/model/filter.model';
import { LiquidityProviderList } from 'src/app/admin/model/lists.model';
import { WidgetItem } from 'src/app/admin/model/widget.model';
import { AdminDataService } from 'src/app/services/admin-data.service';
import { Countries } from 'src/app/model/country-code.model';
import { PaymentInstrument, PaymentProvider, SettingsCurrencyWithDefaults, UserType, WidgetDestination } from 'src/app/model/generated-models';
import { CurrencyView, PaymentInstrumentList, PaymentProviderView, TransactionTypeList } from 'src/app/model/payment.model';
import { UserItem } from 'src/app/model/user.model';
import { AuthService } from 'src/app/services/auth.service';
import { CommonDataService } from 'src/app/services/common-data.service';
import { getCheckedProviderList, getProviderList } from 'src/app/utils/utils';
import {MatTableDataSource} from '@angular/material/table';

@Component({
  selector: 'app-admin-widget-details',
  templateUrl: 'widget-details.component.html',
  styleUrls: ['widget-details.component.scss', '../../assets/scss/_validation.scss']
})
export class AdminWidgetDetailsComponent implements OnInit, OnDestroy {
  @Input() permission = 0;
  @Input()
  set widget(widget: WidgetItem | undefined) {
    if (widget) {
      this.setFormData(widget);
      this.createNew = ((widget?.id ?? '') === '');
      this.widgetId = widget?.id ?? '';
      this.widgetLink = widget?.link ?? '';
      this.widgetMaskLink = widget?.maskLink ?? '';
    }
  }
  @Output() save = new EventEmitter();
  @Output() close = new EventEmitter();

  private subscriptions: Subscription = new Subscription();
  
  displayedColumns: string[] = [
    'details',
    'currency',
    'destination'
  ];
  submitted = false;
  createNew = false;
  saveInProgress = false;
  deleteInProgress = false;
  errorMessage = '';
  currencyOptionsCrypto: CurrencyView[] = [];
  currenciesTable: any = [];
  currencyOptionsFiat: CurrencyView[] = [];
  paymentProviderOptions: PaymentProviderView[] = [];
  filteredProviders: PaymentProviderView[] = [];
  showPaymentProviders = true;
  countryOptions = Countries;
  instrumentOptions = PaymentInstrumentList;
  liquidityProviderOptions = LiquidityProviderList;
  transactionTypeOptions = TransactionTypeList;
  widgetMaskLink = '';
  widgetLink = '';
  widgetId = '';
  isUsersLoading = false;
  usersSearchInput$ = new Subject<string>();
  usersOptions$: Observable<UserItem[]> = of([]);
  minUsersLengthTerm = 1;
  widgetDestinationAddress: WidgetDestination[] = [];
  selectAll: boolean = false;

  form = this.formBuilder.group({
    id: [null],
    countries: [[]],
    currenciesCrypto: [[]],
    currenciesFiat: [[]],
    destinationAddress: [''],
    instruments: [[]],
    liquidityProvider: ['', { validators: [Validators.required], updateOn: 'change' }],
    paymentProviders: [[]],
    transactionTypes: [[]],
    user: [null, { validators: [Validators.required], updateOn: 'change' }],
    name: [undefined, { validators: [Validators.required], updateOn: 'change' }],
    description: [''],
    secret: [''],
    allowToPayIfKycFailed: true
  });

  constructor(
    private formBuilder: FormBuilder,
    private router: Router,
    private auth: AuthService,
    private modalService: NgbModal,
    private commonService: CommonDataService,
    private adminService: AdminDataService) {

  }

  ngOnInit(): void {
    this.initUserSearch();
    this.subscriptions.add(
      this.form.get('instruments')?.valueChanges.subscribe(val => {
        this.filterPaymentProviders(val);
      })
    );
    this.loadPaymentProviders();
    this.loadCurrencies();
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  private initUserSearch() {
    this.usersOptions$ = concat(
      of([]),
      this.usersSearchInput$.pipe(
        filter(res => {
          return res !== null && res.length >= this.minUsersLengthTerm
        }),
        debounceTime(300),
        distinctUntilChanged(),
        tap(() => {
          this.isUsersLoading = true;
        }),
        switchMap(searchString => {
          this.isUsersLoading = false;
          return this.adminService.findUsers(new Filter({
            search: searchString,
            accountTypes: [UserType.Merchant]
          })).pipe(map(result => result.list));
        })
      ));
  }

  private setFormData(widget: WidgetItem): void {
    if (widget) {
      this.widgetDestinationAddress = widget.destinationAddress;
      const user$ = widget.userId ?
        this.getUserFilteredOptions(widget.userId).pipe(take(1), map(users => {
          return users.find(u => u.id === widget.userId);
        })) :
        of(undefined);
      this.subscriptions.add(
        user$.subscribe(userItem => {
          this.form.setValue({
            id: widget.id,
            countries: widget.countriesCode2?.map(code2 => {
              return this.countryOptions.find(c => c.code2 === code2);
            }) ?? [],
            currenciesCrypto: widget.currenciesCrypto ?? [],
            currenciesFiat: widget.currenciesFiat ?? [],
            destinationAddress: widget.destinationAddress ?? '',
            instruments: widget.instruments ?? [],
            liquidityProvider: widget.liquidityProvider ?? null,
            paymentProviders: widget.paymentProviders ?? [],
            transactionTypes: widget.transactionTypes ?? [],
            user: userItem ?? null,
            name: widget.name ?? 'Widget',
            description: widget.description,
            secret: widget.secret,
            allowToPayIfKycFailed: widget.allowToPayIfKycFailed
          });
        })
      );
    }
  }

  private getWidgetItem(): WidgetItem {
    const widget = new WidgetItem(null);
    const formValue = this.form.value;

    widget.id = formValue.id;
    widget.name = formValue.name;
    widget.description = formValue.description;
    widget.userId = formValue.user.id;
    widget.countriesCode2 = formValue.countries.map(c => c.code2);

    if(this.currenciesTable._data._value && this.currenciesTable._data._value.length > 0){
      for(let cryptoCurrency of this.currenciesTable._data._value){
        if(cryptoCurrency.selected){
          widget.currenciesCrypto.push(cryptoCurrency.currency);
          widget.destinationAddress.push({
            currency: cryptoCurrency.currency,
            destination: cryptoCurrency.destination
          });

        }
      }
      console.log(widget.destinationAddress)
      // widget.currenciesCrypto = formValue.currenciesCrypto;
    }
    
    widget.currenciesFiat = formValue.currenciesFiat;
    // widget.destinationAddress = formValue.destinationAddress;
    widget.instruments = formValue.instruments;
    widget.liquidityProvider = formValue.liquidityProvider;
    widget.paymentProviders = formValue.paymentProviders;
    widget.transactionTypes = formValue.transactionTypes;
    widget.secret = formValue.secret;
    widget.allowToPayIfKycFailed = formValue.allowToPayIfKycFailed;
    // widget.destinationAddress = this.widgetDestinationAddress;

    return widget;
  }

  private loadPaymentProviders(): void {
    this.paymentProviderOptions = [];
    this.subscriptions.add(
      this.adminService.getProviders()?.valueChanges.pipe(take(1)).subscribe(({ data }) => {
        const providers = data.getPaymentProviders as PaymentProvider[];
        this.paymentProviderOptions = providers?.map((val) => new PaymentProviderView(val)) as PaymentProviderView[];
        this.filterPaymentProviders(this.form.get('instruments')?.value ?? []);
      }, (error) => {
        this.errorMessage = error;
      })
    );
  }

  private loadCurrencies(): void {
    this.subscriptions.add(
      this.commonService.getSettingsCurrency()?.valueChanges.pipe(take(1)).subscribe(({ data }) => {
        const currencySettings = data.getSettingsCurrency as SettingsCurrencyWithDefaults;
        if (currencySettings.settingsCurrency && (currencySettings.settingsCurrency.count ?? 0 > 0)) {
          // this.currencyOptionsFiat = currencySettings.settingsCurrency.list?.
          //   filter(x => x.fiat === true).
          //   map((val) => new CurrencyView(val)) as CurrencyView[];

          if(currencySettings.settingsCurrency.list && currencySettings.settingsCurrency.list?.length != 0){
            let currenciesCrypto: CurrencyView[] = [];
            let currenciesFiat: CurrencyView[] = [];
            
            for(let currency of currencySettings.settingsCurrency.list){
              if(currency.fiat === false){
                let widgetDestination = this.widgetDestinationAddress.find(wallet => wallet.currency == currency.symbol)
                // let currencyTable = this.currenciesTable.find(item => item.currency == currency.symbol);
                
                currenciesCrypto.push(new CurrencyView(currency));
                
                if(widgetDestination){
                  this.currenciesTable.push(
                    {currency: currency.symbol, destination: widgetDestination.destination, selected: true}
                  )
                  // currencyTable.currency = widgetDestination.currency;
                  // currencyTable.selected = true;
                }else{
                  this.currenciesTable.push(
                    {currency: currency.symbol, destination: '', selected: false}
                  )
                }

                // if(!currencyTable){
                //   this.currenciesTable.push(
                //     {currency: currency.symbol, destination: '', selected: false}
                //   )
                // }
              }else if(currency.fiat === true){
                currenciesFiat.push(new CurrencyView(currency));
              }
            }
            this.currencyOptionsCrypto = currenciesCrypto;
            this.currencyOptionsFiat = currenciesFiat;
            this.currenciesTable = new MatTableDataSource(this.currenciesTable)
          }
          // this.currencyOptionsCrypto = currencySettings.settingsCurrency.list?.
          //   filter(x => x.fiat === false).
          //   map((val) => new CurrencyView(val)) as CurrencyView[];
          
          // this.currenciesTable = currencySettings.settingsCurrency.list?.
          //   filter(x => x.fiat === false).
          //   map((item) => {
          //     return {currency: item.symbol, destination: '', selected: false}
          //   })
        } else {
          this.currenciesTable = [];
          this.currencyOptionsCrypto = [];
          this.currencyOptionsFiat = [];
        }
      }, (error) => {
        this.errorMessage = error;
      })
    );
  }

  private getUserFilteredOptions(searchString: string): Observable<UserItem[]> {
    if (searchString) {
      return this.adminService.findUsers(new Filter({ search: searchString })).pipe(
        map(result => { return result.list; })
      );
    } else {
      return of([]);
    }
  }

  private filterPaymentProviders(instruments: PaymentInstrument[]): void {
    this.filteredProviders = getProviderList(instruments, this.paymentProviderOptions);
    this.showPaymentProviders = this.filteredProviders.length > 0;
    if (this.paymentProviderOptions.length > 0) {
      this.form.get('paymentProviders')?.setValue(getCheckedProviderList(
        this.form.get('paymentProviders')?.value ?? [],
        this.filteredProviders));
    }
  }

  selectCurrency(row): void{
    row.selected = true;
  } 

  selectAllCurrencies(): void{
    this.currenciesTable._data._value = this.currenciesTable._data._value.map(item => {
      if(this.selectAll === true){
        item.selected = false;
      }else if(this.selectAll === false){
        item.selected = true;
      }
      return item;
    })

    this.selectAll = this.selectAll === true ? false : true;
  }

  getCountryFlag(code: string): string {
    return `${code.toLowerCase()}.svg`;
  }

  onSubmit(): void {
    this.submitted = true;
    if (this.form.valid) {
      this.onSave();
    }
  }

  onDeleteWidget(content: any): void {
    const dialog = this.modalService.open(content, {
      backdrop: 'static',
      windowClass: 'modalCusSty',
    });
    this.subscriptions.add(
      dialog.closed.subscribe(data => {
        this.deleteWidget(this.form.value.id);
      })
    );
  }

  private onSave(): void {
    this.saveInProgress = true;
    const widgetItem = this.getWidgetItem();
    const requestData$ = this.adminService.saveWidget(widgetItem);
    this.subscriptions.add(
      requestData$.subscribe(({ data }) => {
        this.saveInProgress = false;
        this.save.emit();
      }, (error) => {
        this.saveInProgress = false;
        this.errorMessage = error;
        if (this.auth.token === '') {
          this.router.navigateByUrl('/');
        }
      })
    );
  }

  private deleteWidget(id: string): void {
    this.deleteInProgress = true;
    const requestData$ = this.adminService.deleteWidget(id);
    this.subscriptions.add(
      requestData$.subscribe(({ data }) => {
        this.deleteInProgress = false;
        this.save.emit();
      }, (error) => {
        this.deleteInProgress = false;
        this.errorMessage = error;
        if (this.auth.token === '') {
          this.router.navigateByUrl('/');
        }
      })
    );
  }
}
