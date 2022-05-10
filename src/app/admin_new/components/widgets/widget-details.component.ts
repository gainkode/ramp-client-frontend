import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { Subscription } from 'rxjs';
import { take } from 'rxjs/operators';
import { WidgetItem } from 'src/app/admin_old/model/widget.model';
import { AdminDataService } from 'src/app/admin_old/services/admin-data.service';
import { Countries } from 'src/app/model/country-code.model';
import { SettingsCurrencyWithDefaults } from 'src/app/model/generated-models';
import { CurrencyView, UserStatusList, UserTypeList } from 'src/app/model/payment.model';
import { AuthService } from 'src/app/services/auth.service';
import { CommonDataService } from 'src/app/services/common-data.service';

@Component({
  selector: 'app-admin-widget-details',
  templateUrl: 'widget-details.component.html',
  styleUrls: ['widget-details.component.scss', '../../assets/scss/_validation.scss']
})
export class AdminWidgetDetailsComponent implements OnInit, OnDestroy {
  @Input() permission = 0;
  @Input()
  set widget(widget: WidgetItem) {
    this.setFormData(widget);
    this.widgetLink = widget?.link ?? '';
    this.widgetMaskLink = widget?.maskLink ?? '';
  }
  @Output() save = new EventEmitter();
  @Output() close = new EventEmitter();

  private subscriptions: Subscription = new Subscription();

  submitted = false;
  saveInProgress = false;
  deleteInProgress = false;
  errorMessage = '';
  currencyOptionsCrypto: Array<CurrencyView> = [];
  currencyOptionsFiat: Array<CurrencyView> = [];
  widgetMaskLink = '';
  widgetLink = '';
  countries = Countries;
  accountStatuses = UserStatusList;
  accountTypes = UserTypeList;
  disableButtonTitle = 'Disable';
  removable = false;
  createNew = false;

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

  constructor(
    private formBuilder: FormBuilder,
    private router: Router,
    private auth: AuthService,
    private modalService: NgbModal,
    private commonService: CommonDataService,
    private adminService: AdminDataService) {

  }

  ngOnInit(): void {
    // this.subscriptions.add(
    //   this.form.get('instruments')?.valueChanges.subscribe(val => {
    //     this.filterPaymentProviders(val);
    //   })
    // );

    this.loadPaymentProviders();
    this.loadCurrencies();
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  private setFormData(widget: WidgetItem): void {
    if (widget) {
      // const user$ = widget.userId ?
      //   this.getUserFilteredOptions(widget.userId).pipe(take(1), map(users => {
      //     return users.find(u => u.id === widget.userId);
      //   })) :
      //   of(undefined);

      this.form.setValue({
        id: widget.id,
        // countries: widget.countriesCode2?.map(code2 => {
        //   return this.countryOptions.find(c => c.code2 === code2);
        // }) ?? [],
        currenciesCrypto: widget.currenciesCrypto ?? [],
        currenciesFiat: widget.currenciesFiat ?? [],
        destinationAddress: widget.destinationAddress ?? '',
        instruments: widget.instruments ?? [],
        liquidityProvider: widget.liquidityProvider ?? null,
        paymentProviders: widget.paymentProviders ?? [],
        transactionTypes: widget.transactionTypes ?? [],
        //user: userItem ?? null,
        name: widget.name ?? 'Widget',
        description: widget.description
      });

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

  private loadPaymentProviders(): void {
    // this.paymentProviderOptions = [];
    // this.subscriptions.add(
    //   this.adminService.getProviders()?.valueChanges.pipe(take(1)).subscribe(({ data }) => {
    //     const providers = data.getPaymentProviders as PaymentProvider[];
    //     this.paymentProviderOptions = providers?.map((val) => new PaymentProviderView(val)) as PaymentProviderView[];
    //     this.filterPaymentProviders(this.form.get('instruments')?.value ?? []);
    //   }, (error) => {
    //     this.snackBar.open(
    //       this.errorHandler.getError(error.message, 'Unable to load payment provider list.'),
    //       undefined,
    //       { duration: 5000 }
    //     );
    //   })
    // );
  }

  private loadCurrencies(): void {
    this.subscriptions.add(
      this.commonService.getSettingsCurrency()?.valueChanges.pipe(take(1)).subscribe(({ data }) => {
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
        // this.snackBar.open(
        //   this.errorHandler.getError(error.message, 'Unable to load currencies.'),
        //   undefined,
        //   { duration: 5000 }
        // );
      })
    );
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

  onDeleteCustomer(content: any): void {
    const dialog = this.modalService.open(content, {
      backdrop: 'static',
      windowClass: 'modalCusSty',
    });
    // this.subscriptions.add(
    //   dialog.closed.subscribe(data => {
    //     if (this.userData?.deleted ?? false) {
    //       this.onRestore(this.userData?.id ?? '');
    //     } else {
    //       this.onDelete(this.userData?.id ?? '');
    //     }
    //   })
    // );
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

  private onDelete(id: string): void {
    this.deleteInProgress = true;
    const requestData$ = this.adminService.deleteWidget(this.form.value.id);
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

  private onRestore(id: string): void {
    this.deleteInProgress = true;
    const requestData$ = this.adminService.restoreCustomer(id);
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

  onClose(): void {
    this.close.emit();
  }
}
