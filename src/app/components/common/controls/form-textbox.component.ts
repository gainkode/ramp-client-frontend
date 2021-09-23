import { Component, Input, SkipSelf } from '@angular/core';
import { AbstractControl, ControlContainer, FormGroupDirective } from '@angular/forms';

@Component({
    selector: 'app-form-textbox',
    templateUrl: 'form-textbox.component.html',
    styleUrls: ['../../../../assets/text-control.scss'],
    viewProviders: [{
        provide: ControlContainer,
        useFactory: (controlContainer: ControlContainer) => controlContainer,
        deps: [[new SkipSelf(), ControlContainer]]
    }]
})
export class FormTextBoxComponent {
    @Input() label = '';
    @Input() assist = '';
    @Input() boxType = '';
    @Input() placeholder = '';
    @Input() maxlength = 0;
    @Input() fieldName = '';
    @Input() field: AbstractControl | null = null;
    @Input() errorMessages: {
        [key: string]: string;
    } = {};
    @Input() set active(val: boolean) {
        this.textBoxEnabled = val;
        if (val === false) {
            this.field?.disable();
        } else {
            this.field?.enable();
        }
    }

    get active(): boolean {
        return this.textBoxEnabled;
    }

    private textBoxEnabled = true;

    get errorAssist(): string {
        let result = '';
        const errors = this.field?.errors;
        if (errors != null) {
            Object.keys(errors).forEach(error => {
                const msg = this.errorMessages[error];
                if (msg) {
                    result = msg;
                    return;
                }
            });
        }
        return result;
    }

    constructor() { }
}
