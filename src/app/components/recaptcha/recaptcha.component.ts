import { Component, EventEmitter, Output } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { EnvService } from 'services/env.service';

@Component({
	selector: 'app-recaptcha',
	templateUrl: 'recaptcha.component.html',
	styleUrls: ['recaptcha.component.scss']
})
export class RecaptchaComponent{
    @Output() completed = new EventEmitter();
    @Output() onReject = new EventEmitter();
    @Output() onError = new EventEmitter<string>();

    siteKey = EnvService.recaptchaSiteKey;
    provider = EnvService.recaptchaProvider;

    constructor(public dialog: MatDialog) {}

    capchaResult(event: string | null): void {
    	localStorage.setItem('recaptchaId', event);
    	this.completed.emit(event);
    }
}
