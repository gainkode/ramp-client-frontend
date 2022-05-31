import { Component, ElementRef, Input, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { WidgetItem } from '../../../model/widget.model';
import { FormBuilder, Validators } from '@angular/forms';
import { ErrorService } from '../../../../services/error.service';
import { LayoutService } from '../../../services/layout.service';
import { PaymentInstrument, PaymentProvider, SettingsCurrencyWithDefaults } from '../../../../model/generated-models';
import {
  CurrencyView,
  PaymentInstrumentList,
  PaymentProviderView,
  TransactionTypeList
} from '../../../../model/payment.model';
import { MatSnackBar } from '@angular/material/snack-bar';
import { CommonDataService } from '../../../../services/common-data.service';
import { AdminDataService } from '../../../../services/admin-data.service';
import { UserItem } from '../../../../model/user.model';
import { BehaviorSubject, Observable, of, Subject, Subscription } from 'rxjs';
import { debounceTime, distinctUntilChanged, map, switchMap, take, takeUntil } from 'rxjs/operators';
import { Filter } from '../../../../admin_new/model/filter.model';
import { Countries, Country } from '../../../../model/country-code.model';
import { MatChipInputEvent } from '@angular/material/chips';
import { MatAutocompleteSelectedEvent } from '@angular/material/autocomplete';
import { LiquidityProviderList } from '../../../model/lists.model';
import { getCheckedProviderList, getProviderList } from 'src/app/utils/utils';

@Component({
  selector: 'app-widget-editor',
  templateUrl: './widget-editor.component.html',
  styleUrls: ['./widget-editor.component.scss']
})
export class WidgetEditorComponent implements OnInit, OnDestroy {
  @Input() permission = 0;
  @Input()
  set widget(widget: WidgetItem) {
    this.setFormData(widget);
    this.widgetLink = widget?.link ?? '';
    this.widgetMaskLink = widget?.maskLink ?? '';
    this.layoutService.setBackdrop(!widget?.id);
  }

  @ViewChild('countrySearchInput') countrySearchInput!: ElementRef<HTMLInputElement>;

  paymentProviderOptions: Array<PaymentProviderView> = [];
  filteredProviders: PaymentProviderView[] = [];
  currencyOptionsCrypto: Array<CurrencyView> = [];
  currencyOptionsFiat: Array<CurrencyView> = [];
  widgetMaskLink = '';
  widgetLink = '';
  countryOptions = Countries;
  instrumentOptions = PaymentInstrumentList;
  liquidityProviderOptions = LiquidityProviderList;
  transactionTypeOptions = TransactionTypeList;
  filteredCountryOptions: Array<Country> = [];
  showPaymentProviders = true;

  form = this.formBuilder.group({
    id: [null],
    countries: [[]],
    currenciesCrypto: [[]],
    currenciesFiat: [[]],
    destinationAddress: [''],
    instruments: [[]],
    liquidityProvider: ['', { validators: [Validators.required], updateOn: 'change' }],
    paymentProviders: [[]],
    transactionTypes: [''],
    user: ['', { validators: [Validators.required], updateOn: 'change' }],
    name: ['', { validators: [Validators.required], updateOn: 'change' }],
    description: ['']
  });

  filteredUserOptions: Array<UserItem> = [];

  private destroy$ = new Subject();
  private subscriptions: Subscription = new Subscription();
  private userSearchString$ = new BehaviorSubject<string>('');
  private countrySearchString$ = new BehaviorSubject<string>('');

  constructor(
    private formBuilder: FormBuilder,
    private commonDataService: CommonDataService,
    private adminDataService: AdminDataService,
    private layoutService: LayoutService,
    private errorHandler: ErrorService,
    private snackBar: MatSnackBar
  ) {

  }

  ngOnInit(): void {
    this.userSearchString$.pipe(
      takeUntil(this.destroy$),
      distinctUntilChanged(),
      debounceTime(1000),
      switchMap(searchString => this.getUserFilteredOptions(searchString))
    ).subscribe(options => {
      this.filteredUserOptions = options;
    });

    this.countrySearchString$.pipe(
      takeUntil(this.destroy$),
      // disabled to properly filter options when values are selected from the DD without search
      // (input empty, not changed)
      // distinctUntilChanged(),
      switchMap(searchString => this.getFilteredCountryOptions(searchString))
    ).subscribe(options => {
      this.filteredCountryOptions = options;
    });

    this.subscriptions.add(
      this.form.get('instruments')?.valueChanges.subscribe(val => {
        this.filterPaymentProviders(val);
      })
    );

    this.loadPaymentProviders();
    this.loadCurrencies();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.subscriptions.unsubscribe();
  }

  onSubmit(): void {
    if (this.form.valid) {
      const widgetItem = this.getWidgetItem();
      this.subscriptions.add(
        this.adminDataService.saveWidget(widgetItem).subscribe(() => {
          this.layoutService.requestRightPanelClose();
        })
      );
    }
  }

  onDelete(): void {
    this.subscriptions.add(
      this.adminDataService.deleteWidget(this.form.value.id).subscribe(() => {
        this.layoutService.requestRightPanelClose();
      })
    );
  }

  onCancel(): void {
    this.layoutService.requestRightPanelClose();
  }

  // region User input

  handleUserInputChange(event: Event): void {
    let searchString = event.target ? (event.target as HTMLInputElement).value : '';
    searchString = searchString.toLowerCase().trim();
    this.userSearchString$.next(searchString);
  }

  formatUserValue(user: UserItem): string {
    return user ?
      (user.fullName + (user.email ? ' (' + user.email + ')' : '')) : '';
  }

  // endregion

  // region Country input

  handleCountrySearchInputChange(event: Event): void {
    let searchString = event.target ? (event.target as HTMLInputElement).value : '';
    searchString = searchString.toLowerCase().trim();
    this.countrySearchString$.next(searchString);
  }

  handleCountryOptionAdded(event: MatChipInputEvent): void {
    const country = this.filteredCountryOptions.find(
      c => c.name.toLowerCase() === event.value.toLowerCase().trim()
    );

    if (country) {
      this.form.controls.countries.setValue([...this.form.controls.countries.value, country]);
    }

    this.countrySearchString$.next('');
    this.countrySearchInput.nativeElement.value = '';
  }

  handleCountryOptionSelected(event: MatAutocompleteSelectedEvent): void {
    if (!this.form.controls.countries.value
      ?.some(x => x.code2 === event.option.id)) {
      this.form.controls.countries
        ?.setValue([
          ...this.form.controls.countries?.value,
          event.option.value
        ]);
    }

    this.countrySearchString$.next('');
    this.countrySearchInput.nativeElement.value = '';
  }

  removeCountryOption(country: Country): void {
    this.form.controls.countries?.setValue(
      this.form.controls.countries?.value.filter(v => v.code2 !== country.code2)
    );
  }

  clearCountryOptions(): void {
    this.form.controls.countries?.setValue([]);
  }

  getCountryFlag(code: string): string {
    return `${code.toLowerCase()}.svg`;
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

  private getFilteredCountryOptions(searchString: string): Observable<Country[]> {
    const filteredOptions = this.countryOptions.filter(c => {
      return (
        !searchString || c.name.toLowerCase().includes(searchString)
      ) && !this.form.controls.countries?.value?.some(s => {
        return s.code2 === c.code2;
      });
    });

    return of(filteredOptions);
  }

  // endregion

  private setFormData(widget: WidgetItem): void {
    if (widget) {
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
            description: widget.description
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
    widget.currenciesCrypto = formValue.currenciesCrypto;
    widget.currenciesFiat = formValue.currenciesFiat;
    widget.destinationAddress = formValue.destinationAddress;
    widget.instruments = formValue.instruments;
    widget.liquidityProvider = formValue.liquidityProvider;
    widget.paymentProviders = formValue.paymentProviders;
    widget.transactionTypes = formValue.transactionTypes;

    return widget;
  }

  private getUserFilteredOptions(searchString: string): Observable<UserItem[]> {
    if (searchString) {
      return this.adminDataService.findUsers(new Filter({ search: searchString })).pipe(
        map(result => { return result.list; })
      );
    } else {
      return of([]);
    }
  }

  private loadPaymentProviders(): void {
    this.paymentProviderOptions = [];
    this.subscriptions.add(
      this.adminDataService.getProviders()?.valueChanges.pipe(take(1)).subscribe(({ data }) => {
        const providers = data.getPaymentProviders as PaymentProvider[];
        this.paymentProviderOptions = providers?.map((val) => new PaymentProviderView(val)) as PaymentProviderView[];
        this.filterPaymentProviders(this.form.get('instruments')?.value ?? []);
      }, (error) => {
        this.snackBar.open(
          this.errorHandler.getError(error.message, 'Unable to load payment provider list.'),
          undefined,
          { duration: 5000 }
        );
      })
    );
  }

  private loadCurrencies(): void {
    this.subscriptions.add(
      this.commonDataService.getSettingsCurrency()?.valueChanges.pipe(take(1)).subscribe(({ data }) => {
        const currencySettings = data.getSettingsCurrency as SettingsCurrencyWithDefaults;
        if (currencySettings.settingsCurrency && (currencySettings.settingsCurrency.count ?? 0 > 0)) {
          this.currencyOptionsFiat = currencySettings.settingsCurrency.list?.
            filter(x => x.fiat === true).
            map((val) => new CurrencyView(val)) as CurrencyView[];
          this.currencyOptionsCrypto = currencySettings.settingsCurrency.list?.
            filter(x => x.fiat === false).
            map((val) => new CurrencyView(val)) as CurrencyView[];
        } else {
          this.currencyOptionsCrypto = [];
          this.currencyOptionsFiat = [];
        }
      }, (error) => {
        this.snackBar.open(
          this.errorHandler.getError(error.message, 'Unable to load currencies.'),
          undefined,
          { duration: 5000 }
        );
      })
    );
  }
}
