import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
    selector: 'app-widget-login-auth',
    templateUrl: 'login-auth.component.html',
    styleUrls: ['../../../assets/payment.scss', '../../../assets/button.scss', '../../../assets/text-control.scss']
})
export class WidgetLoginAuthComponent {
    @Input() email = '';
    @Output() onProgress = new EventEmitter<boolean>();
    @Output() onBack = new EventEmitter();
    @Output() onComplete = new EventEmitter<void>();

    errorMessage = '';

    constructor() { }

    loginError(error: string): void {
        this.errorMessage = error;
    }

    loginProgress(val: boolean): void {
        this.onProgress.emit(val);
    }

    onSubmit(): void {

    }

    goBack(): void {
        this.onBack.emit();
    }
}
