import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CustomText, CustomTextList, CustomTextType } from 'src/app/model/custom-text.model';
import { EnvService } from 'src/app/services/env.service';

@Component({
  selector: 'app-widget-disclaimer',
  templateUrl: 'disclaimer.component.html',
  styleUrls: ['../../../assets/payment.scss', '../../../assets/button.scss']
})
export class WidgetDisclaimerComponent {
  @Input() agreementChecked = false;
  @Output() onBack = new EventEmitter();
  @Output() onNext = new EventEmitter();

  termsLink = EnvService.terms_link;
  productName = EnvService.productFull;
  textDataDefault: string[] = [
    '[%title%]Disclaimer',
    '[%paragraph%]',
    'Dear Customer,',
    'Welcome to {%product%}!',
    '[%paragraph%]',
    'Please note that you are about to Buy Crypto-currency using {%product%} services. {%product%} is a separate entity than the Merchant Website you\'ve been visiting, our services will allow you to Buy & Send Crypto-Currencies to the Crypto Wallet Address provided by the Merchant Website.',
    '[%paragraph%]',
    'Risk Disclaimer: Due to the nature of Crypto-currencies transactions, once a payment is done and order confirmed we will not be able to reverse your payment.',
    '[%paragraph%]',
    'Before using our services, we do recommend to read our <%terms%>Terms & Conditions</%terms%>',
    '[%paragraph%]',
    'Our Crypto-currency quote is refreshing every 60 seconds, the final quote may differ from the initial one, but not the amount paid. the final quote will be presented in the order summary before payment.',
    '[%paragraph%]',
    '[%accept%]I have read and agreed to the disclaimer'
  ];
  textData = new CustomTextList([]);
  TEXT_TYPE: typeof CustomTextType = CustomTextType;

  constructor() {
    this.textData = new CustomTextList(this.textDataDefault);
  }

  checkAgreement(): void {
    this.agreementChecked = !this.agreementChecked;
  }
}
