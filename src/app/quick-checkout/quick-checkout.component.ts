import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { User } from '../model/generated-models';
import { QuickCheckoutDataService } from '../services/quick-checkout.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

@Component({
    templateUrl: 'quick-checkout.component.html',
    styleUrls: ['quick-checkout.scss']
})
export class QuuckCheckoutComponent implements OnInit {
    user: User | null = null;
    firstFormGroup!: FormGroup;
    secondFormGroup!: FormGroup;

    constructor(private auth: AuthService, private dataService: QuickCheckoutDataService,
        private formBuilder: FormBuilder, private router: Router) {
        this.user = auth.user;
    }

    ngOnInit(): void {
        this.firstFormGroup = this.formBuilder.group({
            firstCtrl: ['', Validators.required]
        });
        this.secondFormGroup = this.formBuilder.group({
            secondCtrl: ['', Validators.required]
        });
    }
}
