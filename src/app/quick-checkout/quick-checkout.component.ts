import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { User } from '../model/generated-models';
import { QuickCheckoutDataService } from '../services/quick-checkout.service';

@Component({
    templateUrl: 'quick-checkout.component.html',
    styleUrls: ['quick-checkout.scss']
})
export class QuuckCheckoutComponent {
    user: User | null = null;

    constructor(private auth: AuthService, private dataService: QuickCheckoutDataService,
        private router: Router) {
        this.user = auth.user;
    }
}
