import { Component, EventEmitter, Input, Output } from '@angular/core';
import { LoginResult } from 'src/app/model/generated-models';

@Component({
    selector: 'app-widget-login-auth',
    templateUrl: 'login-auth.component.html',
    styleUrls: ['../../../assets/payment.scss', '../../../assets/button.scss', '../../../assets/text-control.scss']
})
export class WidgetLoginAuthComponent {
    @Input() email = '';
    @Input() widgetId = '';
    @Input() requiredExtraData = false;
    @Output() onProgress = new EventEmitter<boolean>();
    @Output() onBack = new EventEmitter();
    @Output() onComplete = new EventEmitter<LoginResult>();

    errorMessage = '';

    constructor() { }

    loginError(error: string): void {
        this.errorMessage = error;
    }
}
