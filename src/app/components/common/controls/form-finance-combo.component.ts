import { Component, Input, SkipSelf } from '@angular/core';
import { AbstractControl, ControlContainer, FormGroupDirective } from '@angular/forms';
import { CommonTargetValue } from 'src/app/model/common.model';

@Component({
    selector: 'app-form-finance-combo',
    templateUrl: 'form-finance-combo.component.html',
    styleUrls: ['../../../../assets/text-control.scss'],
    viewProviders: [{
        provide: ControlContainer,
        useFactory: (controlContainer: ControlContainer) => controlContainer,
        deps: [[new SkipSelf(), ControlContainer]]
    }]
})
export class FormFinanceComboComponent {
    @Input() label = '';
    @Input() assist = '';
    @Input() placeholder = '';
    @Input() boxFieldName = '';
    @Input() comboFieldName = '';
    @Input() boxField: AbstractControl | null = null;
    @Input() comboField: AbstractControl | null = null;
    @Input() comboList: CommonTargetValue[] = [];
    @Input() errorMessages: {
        [key: string]: string;
    } = {};
    @Input() set active(val: boolean) {
        this.textBoxEnabled = val;
        if (val === false) {
            this.boxField?.disable();
            this.comboField?.disable();
        } else {
            this.boxField?.enable();
            this.comboField?.enable();
        }
    }
    @Input() separator = false;

    get active(): boolean {
        return this.textBoxEnabled;
    }

    private textBoxEnabled = true;

    get invalidForm(): boolean {
        return (this.boxField?.errors) ? true : false;
    }

    get errorAssist(): string {
        let result = '';
        const errors = this.boxField?.errors;
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
