import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormControl } from '@angular/forms';

@Component({
    selector: 'app-widget-login',
    templateUrl: 'login.component.html',
    styleUrls: ['../../../assets/payment.scss', '../../../assets/button.scss', '../../../assets/text-control.scss']
})
export class WidgetLoginComponent {
    @Input() email = '';
    @Output() onError = new EventEmitter<string>();
    @Output() onProgress = new EventEmitter<boolean>();
    @Output() onReset = new EventEmitter<void>();
    @Output() onComplete = new EventEmitter<void>();

    fc = new FormControl('Value');

    constructor() { }

    onSubmit(): void {
        
    }
}
