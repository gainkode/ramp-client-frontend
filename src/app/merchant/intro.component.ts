import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { UserMode } from '../model/generated-models';
import { AuthService } from '../services/auth.service';

@Component({
    templateUrl: 'intro.component.html',
    styleUrls: ['../../assets/menu.scss']
})
export class IntroMerchantComponent implements OnInit {
    constructor(private router: Router, private auth: AuthService) { }

    ngOnInit(): void {
        if (this.auth.authenticated) {
            if (this.auth.user?.mode === UserMode.InternalWallet) {
                this.router.navigateByUrl(this.auth.getUserMainPage());
            }
        }
    }

    routeTo(link: string): void {
        this.router.navigateByUrl(link);
    }
}
