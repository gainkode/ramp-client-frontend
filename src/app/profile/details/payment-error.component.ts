import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { Router } from '@angular/router';
import { PaymentErrorDetails, PaymentWidgetType } from 'model/payment-base.model';
import { ProfileItemContainer, ProfileItemContainerType } from 'model/profile-item.model';
import { AuthService } from 'services/auth.service';

@Component({
	selector: 'app-profile-payment-error',
	templateUrl: './payment-error.component.html',
	styleUrls: ['../../../assets/details.scss', '../../../assets/text-control.scss']
})
export class ProfilePaymentErrorComponent implements OnInit {
    @Input() error: PaymentErrorDetails | undefined;
    @Output() onComplete = new EventEmitter<ProfileItemContainer>();

    transactionType = '';

    constructor(private router: Router, private auth: AuthService) { }

    ngOnInit(): void {
    	if (this.error?.paymentType === PaymentWidgetType.Buy) {
    		this.transactionType = 'BUY';
    	} else if (this.error?.paymentType === PaymentWidgetType.Sell) {
    		this.transactionType = 'SELL';
    	} else if (this.error?.paymentType === PaymentWidgetType.Send) {
    		this.transactionType = 'SEND';
    	} else if (this.error?.paymentType === PaymentWidgetType.Receive) {
    		this.transactionType = 'RECEIVE';
    	} else if (this.error?.paymentType === PaymentWidgetType.Transfer) {
    		this.transactionType = 'TRANSFER';
    	}
    }

    tryAgain(): void {
    	const details = new ProfileItemContainer();
    	details.container = ProfileItemContainerType.PaymentError;
    	details.paymentError = this.error;
    	this.onComplete.emit(details);
    }
}