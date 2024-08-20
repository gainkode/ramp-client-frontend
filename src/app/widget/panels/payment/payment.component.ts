import { ChangeDetectionStrategy, ChangeDetectorRef, Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { PaymentInstrument, PaymentMethod, PaymentProvider, TransactionSource, TransactionType } from 'model/generated-models';
import { WidgetSettings } from 'model/payment-base.model';
import { CheckoutSummary, PaymentProviderInstrumentView } from 'model/payment.model';
import { finalize, Subject, take, takeUntil } from 'rxjs';
import { EnvService } from 'services/env.service';
import { ErrorService } from 'services/error.service';
import { PaymentDataService } from 'services/payment.service';

@Component({
	selector: 'app-widget-payment',
	templateUrl: 'payment.component.html',
	styleUrls: ['../../../../assets/text-control.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class WidgetPaymentComponent implements OnInit, OnDestroy {
  @Input() widget: WidgetSettings;
  @Input() summary: CheckoutSummary | undefined = undefined;
  @Input() errorMessage = '';
  @Output() onBack = new EventEmitter();
  @Output() onError = new EventEmitter();
  @Output() onNotificationStart = new EventEmitter();
  @Output() onSelect = new EventEmitter<{ 
    selectedProvider: PaymentProviderInstrumentView; 
    providers: PaymentProviderInstrumentView[]; 
  }>();
  isLoading = false;
  methodSelected = false;
  paymentProviders: PaymentProviderInstrumentView[] = [];
  methods: PaymentMethod[] = [];
  method!: PaymentMethod;
  private readonly _destroy$ = new Subject<void>();
  constructor(
    private readonly paymentService: PaymentDataService,
    private readonly errorHandler: ErrorService,
    private readonly cdr: ChangeDetectorRef
  ) {
  }


  ngOnInit(): void {
    this.loadPaymentMethods(this.summary, this.widget);
	}

	ngOnDestroy(): void {
		this._destroy$.next();
		this._destroy$.complete();
	}

  methodImage(method: PaymentMethod): string {
    switch (method.name) {
      case PaymentInstrument.Apm:
        return method?.logo ? `${EnvService.image_host}/apm/${method.logo}` : './assets/svg-providers/apm.svg';
      case PaymentInstrument.CreditCard:
        return `./assets/svg-providers/credit-card.svg`;
      case PaymentInstrument.WireTransfer:
        return `./assets/svg-providers/wire-transfer.svg`;
      case PaymentInstrument.FiatVault:
        return `./assets/svg-providers/fiat-vault.png`;
      case PaymentInstrument.OpenBanking:
        return `./assets/svg-providers/wire-transfer.svg`;
      default:
        return './assets/svg-providers/default.svg';
    }
  }

  onPaymentMethodSelected(method: PaymentMethod): void {
    this.method = method;
    this.loadPaymentProviders(this.summary, this.widget, this.method);

    this.methodSelected = true;
  }

  onProviderSeleted(item: PaymentProviderInstrumentView): void{
    this.onSelect.emit({
      selectedProvider: item,
      providers: this.paymentProviders
    });

    this.isLoading = false;
  }

  onBackToDetails(): void {
    if ( this.methodSelected ) {
      this.method = undefined;
      this.methodSelected = false;

      this.loadPaymentMethods(this.summary, this.widget);
    } else {
      this.onBack.emit();
    }
  }

  private loadPaymentMethods(summary: CheckoutSummary, widget: WidgetSettings): void {
    this.isLoading = true;

    this.paymentService.getPaymentMethods(
      widget.widgetId || undefined, 
      this.getSource(widget), 
      summary.transactionType, 
    ).pipe(
      finalize(() => {
        this.isLoading = false, 
        this.cdr.detectChanges();
      }),
      takeUntil(this._destroy$),
      take(1))
    .subscribe({
      next: data => {
        this.methods = data;

        if (this.methods?.length === 1) {
          this.onPaymentMethodSelected(this.methods[0]);
        }
      },
      error: (error) => {
        this.onError.emit(this.errorHandler.getError(error.message,'Unable to load payment methods'));
      }
    });
	}

  private loadPaymentProviders(summary: CheckoutSummary, widget: WidgetSettings, method: PaymentMethod): void {
		let fiatCurrency = '';
		const amount: number = summary.amountFrom ?? 0;

		if (summary.transactionType === TransactionType.Buy) {
			fiatCurrency = summary.currencyFrom;
		} else if (summary.transactionType === TransactionType.Sell) {
			fiatCurrency = summary.currencyTo;
		}

    this.isLoading = true;

		const providersData$ = this.paymentService.getProviders(
			fiatCurrency, 
      widget.widgetId || undefined, 
      this.getSource(widget), 
      summary.transactionType, 
      method.paymentMethodId,
      amount
		).pipe(
      finalize(() => {
        this.cdr.detectChanges();
      }),
      takeUntil(this._destroy$), 
      take(1));

    providersData$.subscribe({
      next: paymentProviders => {
        this.paymentProviders = this.getPaymentProviderList(
          summary,
          paymentProviders,
          method
        );

        if (this.paymentProviders.length === 1) {
          this.onProviderSeleted(this.paymentProviders[0]);
        } else if (this.paymentProviders.length === 0) {
          this.onError.emit(`No supported payment providers found for "${this.summary.currencyFrom}`);
        } else if (this.paymentProviders.length > 1) {
          this.onNotificationStart.emit();
          this.isLoading = false;
        }
      },
      error: (error) => {
        this.onError.emit(this.errorHandler.getError(error.message, 'Unable to load payment instruments'));
        this.isLoading = false;
      }
    });
	}

  private getPaymentProviderList(summary: CheckoutSummary, list: PaymentProvider[], method: PaymentMethod): PaymentProviderInstrumentView[] {
		let currency = '';

		if (summary.transactionType === TransactionType.Buy) {
			currency = summary.currencyFrom ?? '';
		} else if (summary.transactionType === TransactionType.Sell) {
			currency = summary.currencyTo ?? '';
		}

		const dataList = list
			.filter(x => x.currencies?.includes(currency, 0) || x.currencies?.length === 0)
			.map(val => new PaymentProviderInstrumentView(val, method.name));

		return dataList;
	}

  private getSource(widget: WidgetSettings): TransactionSource {
		let source = TransactionSource.Wallet;
		if (widget.embedded === false) {
			source = widget.widgetId === '' ? TransactionSource.QuickCheckout : TransactionSource.Widget;
		}
		return source;
	}
}
