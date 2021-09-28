import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
    selector: 'app-widget-login',
    templateUrl: 'login.component.html',
    styleUrls: ['../../../assets/payment.scss', '../../../assets/button.scss']
})
export class WidgetLoginComponent {
    @Input() email = '';
    @Output() onError = new EventEmitter<string>();
    @Output() onProgress = new EventEmitter<boolean>();
    @Output() onReset = new EventEmitter<void>();
    @Output() onComplete = new EventEmitter<void>();

    constructor() { }

    onSubmit(): void {
        
    }
}
