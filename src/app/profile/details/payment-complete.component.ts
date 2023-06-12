import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { Router } from '@angular/router';
import { PaymentCompleteDetails, PaymentWidgetType } from 'model/payment-base.model';
import { ProfileItemContainer, ProfileItemContainerType } from 'model/profile-item.model';
import { AuthService } from 'services/auth.service';

@Component({
	selector: 'app-profile-payment-complete',
	templateUrl: './payment-complete.component.html',
	styleUrls: ['../../../assets/button.scss', '../../../assets/details.scss', '../../../assets/text-control.scss']
})
export class ProfilePaymentCompleteComponent implements OnInit {
    @Input() payment: PaymentCompleteDetails | undefined;
    @Output() onComplete = new EventEmitter<ProfileItemContainer>();

    title = '';
    amount = '';

    constructor(private router: Router, private auth: AuthService) { }

    ngOnInit(): void {
    	if (this.payment?.paymentType === PaymentWidgetType.Buy) {
    		this.title = 'You just bought';
    		if (this.payment) {
    			this.amount = `${this.payment.amount} ${this.payment.currency}`;
    		}
    	} else if (this.payment?.paymentType === PaymentWidgetType.Sell) {
    		this.title = 'You just sold';
    		if (this.payment) {
    			this.amount = `${this.payment.amount} ${this.payment.currency}`;
    		}
    	} else if (this.payment?.paymentType === PaymentWidgetType.Send) {
    		this.title = 'You just sent';
    		if (this.payment) {
    			this.amount = `${this.payment.amount} ${this.payment.currency}`;
    		}
    	} else if (this.payment?.paymentType === PaymentWidgetType.Transfer) {
    		this.title = 'You just bought & sent';
    		if (this.payment) {
    			this.amount = `${this.payment.amount} ${this.payment.currency}`;
    		}
    	} else {
    		this.title = 'Title initialization';
    		this.amount = '';
    	}
    }

    viewTransaction(): void {
    	const details = new ProfileItemContainer();
    	details.container = ProfileItemContainerType.PaymentComplete;
    	this.onComplete.emit(details);
    	this.router.navigateByUrl(`${this.auth.getUserMainPage()}/transactions`);
    }
}