import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
    selector: 'app-widget-login',
    templateUrl: 'login.component.html',
    styleUrls: ['../../../assets/payment.scss', '../../../assets/button.scss', '../../../assets/text-control.scss']
})
export class WidgetLoginComponent {
    @Input() email = '';
    @Output() onError = new EventEmitter<string>();
    @Output() onProgress = new EventEmitter<boolean>();
    @Output() onBack = new EventEmitter();
    @Output() onComplete = new EventEmitter<void>();

    constructor() { }

    loginError(error: string): void {
        this.onError.emit(error);
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
