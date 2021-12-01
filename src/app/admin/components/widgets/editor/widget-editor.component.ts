import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { WidgetItem } from '../../../model/widget.model';
import { FormBuilder, Validators } from '@angular/forms';
import { PaymentDataService } from '../../../../services/payment.service';
import { ErrorService } from '../../../../services/error.service';
import { LayoutService } from '../../../services/layout.service';
import { PaymentProvider, SettingsCurrencyWithDefaults } from '../../../../model/generated-models';
import { CurrencyView, PaymentProviderView } from '../../../../model/payment.model';
import { MatSnackBar } from '@angular/material/snack-bar';
import { CommonDataService } from '../../../../services/common-data.service';
import { AdminDataService } from '../../../services/admin-data.service';
import { UserItem } from '../../../../model/user.model';
import { BehaviorSubject, Observable, of, Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged, map, startWith, switchMap, take, takeUntil } from 'rxjs/operators';
import { Filter } from '../../../model/filter.model';

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

  widgetId?: string;
  paymentProviders: Array<PaymentProviderView> = [];
  currencies: Array<CurrencyView> = [];

  form = this.formBuilder.group({
    id: [''],
    additionalSettings: ['', { updateOn: 'change' }],
    countriesCode2: [[], { validators: [Validators.required], updateOn: 'change' }],
    currenciesFrom: [[], { validators: [Validators.required], updateOn: 'change' }],
    currenciesTo: [[], { validators: [Validators.required], updateOn: 'change' }],
    destinationAddresses: [[], { validators: [Validators.required], updateOn: 'change' }],
    instruments: [[], { validators: [Validators.required], updateOn: 'change' }],
    liquidityProvider: ['', { validators: [Validators.required], updateOn: 'change' }],
    paymentProviders: [[], { validators: [Validators.required], updateOn: 'change' }],
    transactionTypes: ['', { validators: [Validators.required], updateOn: 'change' }],
    userId: ['', { validators: [Validators.required], updateOn: 'change' }]
  });

  filteredUserOptions: Array<UserItem> = [];

  private destroy$ = new Subject();
  private userSearchString$ = new BehaviorSubject<string>('');

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

    this.loadPaymentProviders();
    this.loadCurrencies();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
  }

  onSubmit(): void {
    console.log('submit', this.form.value);
    const widgetItem = this.getWidgetItem();
    this.adminDataService.saveWidget(widgetItem).subscribe(() => {});
  }

  onDelete(): void {

  }

  onCancel(): void {
    this.layoutService.requestRightPanelClose();
  }

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
        countriesCode2: widget.countriesCode2,
        currenciesFrom: widget.currenciesFrom,
        currenciesTo: widget.currenciesTo,
        destinationAddresses: widget.destinationAddresses,
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
    widget.userId = formValue.user;

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
    this.paymentProviders = [];
    this.paymentDataService.getProviders()
        ?.valueChanges
        .subscribe(({ data }) => {
          const providers = data.loadPaymentProviders as PaymentProvider[];
          this.paymentProviders = providers?.map((val) => new PaymentProviderView(val)) as PaymentProviderView[];
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
            this.currencies = currencySettings.settingsCurrency.list
                                              ?.map((val) => new CurrencyView(val)) as CurrencyView[];
          } else {
            this.currencies = [];
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
