import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { AbstractControl, FormBuilder, Validators } from '@angular/forms';
import { Subscription } from 'rxjs';
import { PaymentInstrument, PaymentProvider } from 'src/app/model/generated-models';
import { CardView, CheckoutSummary, PaymentInstrumentView, PaymentProviderList, PaymentProviderView, QuickCheckoutPaymentInstrumentList, WidgetSettings } from 'src/app/model/payment.model';

@Component({
  selector: 'app-widget-payment',
  templateUrl: 'payment.component.html',
  styleUrls: ['../../../assets/payment.scss', '../../../assets/button.scss', '../../../assets/text-control.scss']
})
export class WidgetPaymentComponent implements OnInit, OnDestroy {
  @Input() settings: WidgetSettings = new WidgetSettings();
  @Input() summary: CheckoutSummary | undefined = undefined;
  @Output() onBack = new EventEmitter();
  @Output() onError = new EventEmitter<string>();
  @Output() onProgress = new EventEmitter<boolean>();
  @Output() onComplete = new EventEmitter<CheckoutSummary>();

  private pSubscriptions: Subscription = new Subscription();
  private card = '';

  validData = false;
  showCreditCard = false;
  currentInstrument: PaymentInstrumentView | undefined = undefined;
  currentProvider: PaymentProviderView | undefined = undefined;
  instrumentList = QuickCheckoutPaymentInstrumentList;
  providerList = PaymentProviderList;

  dataForm = this.formBuilder.group({
    instrument: [undefined, { validators: [Validators.required], updateOn: 'change' }],
    provider: [undefined, { validators: [Validators.required], updateOn: 'change' }]
  });

  get instrumentField(): AbstractControl | null {
    return this.dataForm.get('instrument');
  }

  get providerField(): AbstractControl | null {
    return this.dataForm.get('provider');
  }

  constructor(
    private formBuilder: FormBuilder) { }

  ngOnInit(): void {
    this.pSubscriptions.add(this.instrumentField?.valueChanges.subscribe(val => this.onInstrumentUpdated(val)));
    this.pSubscriptions.add(this.providerField?.valueChanges.subscribe(val => this.onProviderUpdated(val)));
    this.currentInstrument = this.instrumentList.find(x => x.id === PaymentInstrument.CreditCard);
    if (this.summary?.instrument) {
      this.instrumentField?.setValue(this.summary?.instrument);
    } else {
      this.instrumentField?.setValue(PaymentInstrument.CreditCard);
    }
  }

  ngOnDestroy(): void {
    this.pSubscriptions.unsubscribe();
  }

  private onInstrumentUpdated(val: PaymentInstrument): void {
    this.currentInstrument = this.instrumentList.find(x => x.id === val);
    this.showCreditCard = (this.currentInstrument?.id === PaymentInstrument.CreditCard);
    if (this.showCreditCard) {
      this.providerField?.setValue(PaymentProvider.Fibonatix);
    } else {
      if (this.summary?.provider) {
        this.providerField?.setValue(this.summary?.provider);
      } else {
        this.providerField?.setValue(PaymentProvider.Bank);
      }
      this.validData = false;
    }
  }

  private onProviderUpdated(val: PaymentProvider): void {
    this.currentProvider = this.providerList.find(x => x.id === val);
  }

  updateCardInfo(data: CardView): void {
    this.validData = data.valid;
    if (this.validData) {
      this.card = JSON.stringify(data);
    }
  }

  onSubmit(): void {
    if (this.dataForm.valid && this.validData) {
      const data = new CheckoutSummary();
      data.setPaymentInfo(
        this.currentProvider?.id ?? PaymentProvider.Fibonatix,
        this.currentInstrument?.id ?? PaymentInstrument.CreditCard,
        this.card);
      this.onComplete.emit(data);
    }
  }
}
