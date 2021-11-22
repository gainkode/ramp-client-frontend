import { AfterViewInit, Component, EventEmitter, Input, OnInit, Output } from "@angular/core";
import { PaymentCompleteDetails, PaymentWidgetType } from "src/app/model/payment.model";
import { ProfileItemContainer } from "src/app/model/profile-item.model";

@Component({
    selector: 'app-personal-payment-complete',
    templateUrl: './payment-complete.component.html',
    styleUrls: ['../../../../assets/button.scss', '../../../../assets/details.scss', '../../../../assets/text-control.scss']
})
export class PersonalPaymentCompleteComponent implements OnInit {
    @Input() payment: PaymentCompleteDetails | undefined;
    @Output() onComplete = new EventEmitter<ProfileItemContainer>();

    title = '';
    amount = '';

    constructor() { }

    ngOnInit(): void {
        if (this.payment?.paymentType === PaymentWidgetType.Buy) {
            this.title = 'You just bought';
            if (this.payment) {
                this.amount = `${this.payment.amount} ${this.payment.currency}`;
            }
        } else {
            this.title = 'Title initialization';
            this.amount = '';
        }
    }

    done(): void {

    }
}