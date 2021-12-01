import { Component, ElementRef, Input, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { WidgetItem } from '../../../model/widget.model';
import { FormBuilder, Validators } from '@angular/forms';
import { PaymentDataService } from '../../../../services/payment.service';
import { ErrorService } from '../../../../services/error.service';
import { LayoutService } from '../../../services/layout.service';
import {
  LiquidityProvider,
  PaymentInstrument,
  PaymentProvider,
  SettingsCurrencyWithDefaults
} from '../../../../model/generated-models';
import {
  CurrencyView,
  PaymentInstrumentList,
  PaymentProviderView,
  TransactionTypeList
} from '../../../../model/payment.model';
import { MatSnackBar } from '@angular/material/snack-bar';
import { CommonDataService } from '../../../../services/common-data.service';
import { AdminDataService } from '../../../services/admin-data.service';
import { UserItem } from '../../../../model/user.model';
import { BehaviorSubject, Observable, of, Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged, map, startWith, switchMap, take, takeUntil } from 'rxjs/operators';
import { Filter } from '../../../model/filter.model';
import { Countries, Country } from '../../../../model/country-code.model';
import { MatChipInputEvent } from '@angular/material/chips';
import { MatAutocompleteSelectedEvent } from '@angular/material/autocomplete';
import { LiquidityProviderList } from '../../../model/lists.model';

@Component({
  selector: 'app-widget-editor',
  templateUrl: './widget-editor.component.html',
  styleUrls: ['./widget-editor.component.scss']
})
export class WidgetEditorComponent implements OnInit, OnDestroy {

  @Input()
  set widget(widget: WidgetItem) {
    this.widgetId = widget.id;
    this.setFormData(widget);
    this.layoutService.setBackdrop(!this.widgetId);
  }

  @ViewChild('countrySearchInput') countrySearchInput!: ElementRef<HTMLInputElement>;

  widgetId?: string;
  paymentProviderOptions: Array<PaymentProviderView> = [];
  currencyOptions: Array<CurrencyView> = [];

  countryOptions = Countries;
  instrumentOptions = PaymentInstrumentList;
  liquidityProviderOptions = LiquidityProviderList;
  transactionTypeOptions = TransactionTypeList;
  filteredCountryOptions: Array<Country> = [];

  form = this.formBuilder.group({
    id: [''],
    additionalSettings: ['', { updateOn: 'change' }],
    countries: [[], { validators: [Validators.required], updateOn: 'change' }],
    currenciesFrom: [[], { validators: [Validators.required], updateOn: 'change' }],
    currenciesTo: [[], { validators: [Validators.required], updateOn: 'change' }],
    destinationAddresses: [[], { validators: [Validators.required], updateOn: 'change' }],
    instruments: [[], { validators: [Validators.required], updateOn: 'change' }],
    liquidityProvider: ['', { validators: [Validators.required], updateOn: 'change' }],
    paymentProviders: [[], { validators: [Validators.required], updateOn: 'change' }],
    transactionTypes: ['', { validators: [Validators.required], updateOn: 'change' }],
    user: ['', { validators: [Validators.required], updateOn: 'change' }]
  });

  filteredUserOptions: Array<UserItem> = [];

  private destroy$ = new Subject();
  private userSearchString$ = new BehaviorSubject<string>('');
  private countrySearchString$ = new BehaviorSubject<string>('');

  constructor(
    private formBuilder: FormBuilder,
    private commonDataService: CommonDataService,
    private paymentDataService: PaymentDataService,
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
    )
        .subscribe(options => {
          this.filteredUserOptions = options;
        });

    this.countrySearchString$.pipe(
      takeUntil(this.destroy$),
      // disabled to properly filter options when values are selected from the DD without search
      // (input empty, not changed)
      // distinctUntilChanged(),
      switchMap(searchString => this.getFilteredCountryOptions(searchString))
    )
        .subscribe(options => {
          this.filteredCountryOptions = options;
        });

    this.loadPaymentProviders();
    this.loadCurrencies();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
  }

  onSubmit(): void {
    console.log('submit', this.form.value);
    const widgetItem = this.getWidgetItem();
    this.adminDataService.saveWidget(widgetItem)
        .subscribe(() => {
        });
  }

  onDelete(): void {
    this.adminDataService.deleteWidget(this.form.value.id);
  }

  onCancel(): void {
    this.layoutService.requestRightPanelClose();
  }

  // region User input

  handleUserInputChange(event: Event): void {
    let searchString = event.target ? (event.target as HTMLInputElement).value : '';
    searchString = searchString.toLowerCase()
                               .trim();
    this.userSearchString$.next(searchString);
  }

  formatUserValue(user: UserItem): string {
    return user ?
      (user.fullName + (user.email ? ' (' + user.email + ')' : '')) :
      '';
  }

  // endregion

  // region Country input

  handleCountrySearchInputChange(event: Event): void {
    let searchString = event.target ? (event.target as HTMLInputElement).value : '';
    searchString = searchString.toLowerCase()
                               .trim();
    this.countrySearchString$.next(searchString);
  }

  handleCountryOptionAdded(event: MatChipInputEvent): void {
    const country = this.filteredCountryOptions.find(
      c => c.name.toLowerCase() === event.value.toLowerCase()
                                         .trim()
    );

    if (country) {
      this.form.controls.countries.setValue([...this.form.controls.countries.value, country]);
    }

    this.countrySearchString$.next('');
    this.countrySearchInput.nativeElement.value = '';
  }

  handleCountryOptionSelected(event: MatAutocompleteSelectedEvent): void {
    if (!this.form.controls.countries.value
             .some(x => x.code2 === event.option.id)) {
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
    this.form.controls.countries
        ?.setValue(
          this.form.controls.countries
              ?.value
              .filter(v => v.code2 !== country.code2)
        );
  }

  clearCountryOptions(): void {
    this.form.controls.countries
        ?.setValue([]);
  }

  getCountryFlag(code: string): string {
    return `${code.toLowerCase()}.svg`;
  }

  private getFilteredCountryOptions(searchString: string): Observable<Country[]> {
    const filteredOptions = this.countryOptions.filter(c => {
      return (
        !searchString || c.name.toLowerCase()
                          .includes(searchString)
      ) && !this.form.controls.countries.value
                .some(s => {
                  return s.code2 === c.code2;
                });
    });

    return of(filteredOptions);
  }

  // endregion

  private setFormData(widget: WidgetItem): void {
    this.form.reset();

    const user$ = widget.userId ?
      this.getUserFilteredOptions(widget.userId)
          .pipe(
            take(1),
            map(users => {
              return users.find(u => u.id === widget.userId);
            })
          )
      :
      of(undefined);

    user$.subscribe(userItem => {

      this.form.setValue({
        id: widget.id,
        additionalSettings: widget.additionalSettings,
        countries: widget.countriesCode2?.map(code2 => {
          return this.countryOptions.find(c => c.code2 === code2);
        }),
        currenciesFrom: widget.currenciesFrom,
        currenciesTo: widget.currenciesTo,
        destinationAddresses: (widget.destinationAddresses && widget.destinationAddresses.length > 0) ?
          widget.destinationAddresses[0] : '',
        instruments: widget.instruments,
        liquidityProvider: widget.liquidityProvider,
        paymentProviders: widget.paymentProviders,
        transactionTypes: widget.transactionTypes,
        user: userItem
      });
    });

  }

  private getWidgetItem(): WidgetItem {
    const widget = new WidgetItem(null);
    const formValue = this.form.value;

    widget.id = formValue.id;
    widget.userId = formValue.user.id;
    widget.additionalSettings = formValue.additionalSettings;
    widget.countriesCode2 = formValue.countries.map(c => c.code2);
    widget.currenciesFrom = formValue.currenciesFrom;
    widget.currenciesTo = formValue.currenciesTo;
    widget.destinationAddresses = formValue.destinationAddresses;
    widget.instruments = formValue.instruments;
    widget.liquidityProvider = formValue.liquidityProvider;
    widget.paymentProviders = formValue.paymentProviders;
    widget.transactionTypes = formValue.transactionTypes;

    return widget;
  }

  private getUserFilteredOptions(searchString: string): Observable<UserItem[]> {
    if (searchString) {
      return this.adminDataService.getUsers(
        0,
        100,
        'email',
        false,
        new Filter({ search: searchString })
      )
                 .pipe(
                   map(result => {
                     return result.list;
                   })
                 );
    } else {
      return of([]);
    }
  }

  private loadPaymentProviders(): void {
    this.paymentProviderOptions = [];
    this.paymentDataService.getProviders()
        ?.valueChanges
        .subscribe(({ data }) => {
          const providers = data.getPaymentProviders as PaymentProvider[];
          this.paymentProviderOptions = providers?.map((val) => new PaymentProviderView(val)) as PaymentProviderView[];
          console.log('ppo', this.paymentProviderOptions);
        }, (error) => {
          this.snackBar.open(
            this.errorHandler.getError(error.message, 'Unable to load payment provider list.'),
            undefined,
            { duration: 5000 }
          );
        });
  }

  private loadCurrencies(): void {
    this.commonDataService.getSettingsCurrency()
        ?.valueChanges
        .subscribe(({ data }) => {
          const currencySettings = data.getSettingsCurrency as SettingsCurrencyWithDefaults;

          if (currencySettings.settingsCurrency && (currencySettings.settingsCurrency.count ?? 0 > 0)) {
            this.currencyOptions = currencySettings.settingsCurrency.list
                                                   ?.map((val) => new CurrencyView(val)) as CurrencyView[];
          } else {
            this.currencyOptions = [];
          }
        }, (error) => {
          this.snackBar.open(
            this.errorHandler.getError(error.message, 'Unable to load payment provider list.'),
            undefined,
            { duration: 5000 }
          );
        });
  }

}
