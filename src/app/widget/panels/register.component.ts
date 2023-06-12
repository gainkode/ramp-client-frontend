import { Component, EventEmitter, Input, Output } from '@angular/core';
import { UserType } from 'model/generated-models';

@Component({
    selector: 'app-widget-register',
    templateUrl: 'register.component.html',
    styleUrls: ['../../../assets/payment.scss', '../../../assets/auth.scss', '../../../assets/button.scss']
})
export class WidgetRegisterComponent {
    @Input() email = '';
    @Output() onError = new EventEmitter<string>();
    @Output() onProgress = new EventEmitter<boolean>();
    @Output() onBack = new EventEmitter();
    @Output() onComplete = new EventEmitter<string>();

    errorMessage = '';
    userType = UserType.Personal;
    success = false;

    constructor() { }

    registerError(error: string): void {
        this.errorMessage = error;
    }

    registerComplete(email: string): void {
        this.success = true;
    }
}
