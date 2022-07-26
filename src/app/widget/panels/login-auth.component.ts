import { Component, EventEmitter, Input, Output } from '@angular/core';
import { LoginResult } from 'src/app/model/generated-models';
import { WidgetSettings } from 'src/app/model/payment-base.model';

@Component({
    selector: 'app-widget-login-auth',
    templateUrl: 'login-auth.component.html',
    styleUrls: ['../../../assets/payment.scss', '../../../assets/button.scss', '../../../assets/text-control.scss']
})
export class WidgetLoginAuthComponent {
    @Input() email = '';
    @Input() widget = new WidgetSettings();
    @Input() errorMessage = '';
    @Input() requiredExtraData = false;
    @Input() allowCreate = true;
    @Output() onProgress = new EventEmitter<boolean>();
    @Output() onBack = new EventEmitter();
    @Output() onComplete = new EventEmitter<LoginResult>();

    constructor() { }

    loginError(error: string): void {
        this.errorMessage = error;
    }
}
