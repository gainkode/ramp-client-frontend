import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { User } from '../model/generated-models';
import { QuickCheckoutDataService } from '../services/quick-checkout.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { WalletValidator } from '../utils/wallet.validator';

//const WAValidator = require('multicoin-address-validator');

@Component({
    templateUrl: 'quick-checkout.component.html',
    styleUrls: ['quick-checkout.scss']
})
export class QuuckCheckoutComponent implements OnInit {
    user: User | null = null;
    secondFormGroup!: FormGroup;
    detailsForm = this.formBuilder.group({
        email: ['', {
            validators: [
                Validators.required,
                Validators.pattern('^[a-zA-Z0-9_.+\-]+@[a-zA-Z0-9\-]+\.[a-zA-Z0-9\-\.]+$')
            ], updateOn: 'change'
        }],
        //currencyFrom: ['', { validators: [Validators.required], updateOn: 'change' }],
        //currencyTo: ['', { validators: [Validators.required], updateOn: 'change' }],
        address: ['', { validators: [Validators.required], updateOn: 'change' }]
    }, { validators: [WalletValidator.addressValidator('address', 'currencyTo')], updateOn: 'change'
    });

    constructor(private auth: AuthService, private dataService: QuickCheckoutDataService,
        private formBuilder: FormBuilder, private router: Router) {
        this.user = auth.user;
    }

    ngOnInit(): void {
        this.secondFormGroup = this.formBuilder.group({
            secondCtrl: ['', Validators.required]
        });
    }
}
