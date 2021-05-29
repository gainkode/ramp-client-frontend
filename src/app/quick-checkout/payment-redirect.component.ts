import { Component, OnInit } from "@angular/core";
import { Router } from "@angular/router";

@Component({
    templateUrl: 'payment-redirect.component.html'
})
export class PaymentRedirectComponent implements OnInit {

    constructor(private router: Router) { }

    ngOnInit(): void {
        const html = sessionStorage.getItem('paymentDone');
        sessionStorage.removeItem('paymentDone');
        if (html) {
            document.open()
            document.write(html);
            document.close();
        }
    }
}



