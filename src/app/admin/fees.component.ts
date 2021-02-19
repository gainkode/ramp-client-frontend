import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { FeeSheme, FeeShemes } from '../model/fake-fee-schemes.model';

@Component({
    templateUrl: 'fees.component.html',
    styleUrls: ['admin.scss', 'fees.component.scss']
})
export class FeesComponent {
    displayedColumns: string[] = [
      'isDefault', 'name', 'target', 'trxType', 'instrument', 'provider', 'details'
    ];
    schemes = FeeShemes;

    constructor(private auth: AuthService, private router: Router) { }
}
