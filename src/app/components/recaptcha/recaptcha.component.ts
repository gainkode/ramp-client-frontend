import { Component, OnInit, Output, EventEmitter, OnDestroy } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Subscription } from 'rxjs';
import { AuthService } from '../../services/auth.service';
import { EnvService } from '../../../app/services/env.service';


@Component({
    selector: 'recaptcha',
    templateUrl: 'recaptcha.component.html',
    styleUrls: ['../../../assets/button.scss']
})
export class RecaptchaComponent implements OnInit, OnDestroy {
    @Output() completed = new EventEmitter();
    @Output() onReject = new EventEmitter();
    @Output() onError = new EventEmitter<string>();

    private pTokenSubscription: Subscription | undefined = undefined;

    siteKey = EnvService.recaptchaSiteKey;
    provider = EnvService.recaptchaProvider;
    constructor(
        public dialog: MatDialog,
        private auth: AuthService) {
    }

    ngOnInit(): void {}

    ngOnDestroy(): void {
    }

    capchaResult(event){
        localStorage.setItem('recaptchaId', event);
        this.completed.emit(event);
    }
}
