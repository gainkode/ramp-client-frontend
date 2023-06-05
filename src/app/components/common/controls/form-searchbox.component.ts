import { Component, EventEmitter, Host, Input, Optional, Output, SkipSelf, ViewChild } from '@angular/core';
import { ControlContainer, ControlValueAccessor, UntypedFormControl, FormControlDirective, NG_VALUE_ACCESSOR } from '@angular/forms';

@Component({
    selector: 'app-form-searchbox',
    templateUrl: 'form-searchbox.component.html',
    styleUrls: ['../../../../assets/text-control.scss', '../../../../assets/button.scss'],
    providers: [{
        provide: NG_VALUE_ACCESSOR,
        useExisting: FormSearchBoxComponent,
        multi: true
    }]
})
export class FormSearchBoxComponent implements ControlValueAccessor {
    @ViewChild(FormControlDirective, { static: true })
    formControlDirective!: FormControlDirective;
    @Input() maxlength = 0;
    @Input() formControl!: UntypedFormControl;
    @Input() formControlName!: string;
    @Output() onSearch = new EventEmitter();

    active = true;

    get control(): UntypedFormControl {
        return this.formControl || this.controlContainer.control?.get(this.formControlName);
    }

    constructor(
        @Optional() @Host() @SkipSelf()
        private controlContainer: ControlContainer) {
    }

    registerOnTouched(fn: any): void {
        this.formControlDirective.valueAccessor?.registerOnTouched(fn);
    }

    registerOnChange(fn: any): void {
        this.formControlDirective.valueAccessor?.registerOnChange(fn);
    }

    writeValue(obj: any): void {
        this.formControlDirective.valueAccessor?.writeValue(obj);
    }
    
    setDisabledState(isDisabled: boolean): void {
        this.active = !isDisabled;
    }
}
