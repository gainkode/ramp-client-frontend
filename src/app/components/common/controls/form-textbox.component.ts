import { Component, ElementRef, Host, Input, OnDestroy, OnInit, Optional, SkipSelf, ViewChild } from '@angular/core';
import { ControlContainer, ControlValueAccessor, FormControl, FormControlDirective, NG_VALUE_ACCESSOR } from '@angular/forms';
import { Subscription } from 'rxjs';

@Component({
    selector: 'app-form-textbox',
    templateUrl: 'form-textbox.component.html',
    styleUrls: ['../../../../assets/text-control.scss'],
    providers: [{
        provide: NG_VALUE_ACCESSOR,
        useExisting: FormTextBoxComponent,
        multi: true
    }]
})
export class FormTextBoxComponent implements ControlValueAccessor, OnInit, OnDestroy {
    @ViewChild(FormControlDirective, { static: true })
    formControlDirective!: FormControlDirective;
    @Input() label = '';
    @Input() smallLabel = false;
    @Input() assist = '';
    @Input() boxType = '';
    @Input() placeholder = '';
    @Input() inputMask = '';
    @Input() maxlength = 0;
    @Input() errorMessages: {[key: string]: string} = {};
    @Input() formControl!: FormControl;
    @Input() formControlName!: string;
    @Input() numberField = false;
    @Input() inputMode = 'text';
    @Input() inputPattern = '';
    @Input() upperCase = false;
    @Input() separator = false;

    private controlSubscription: Subscription | undefined = undefined;
    initialized = false;
    active = true;
    
    errorMessage = '';

    get control(): FormControl {
        return this.formControl || this.controlContainer.control?.get(this.formControlName);
    }

    constructor(
        @Optional() @Host() @SkipSelf()
        private controlContainer: ControlContainer) {
    }
    
    private getError(): string {
        let result = '';
        const errors = this.control?.errors;
        if (errors) {
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

    ngOnInit(): void {
        this.controlSubscription = this.control?.valueChanges.subscribe(val => {
            this.initialized = true;
            this.errorMessage = this.getError();
        });
    }

    ngOnDestroy(): void {
        if (this.controlSubscription) {
            this.controlSubscription.unsubscribe();
            this.controlSubscription = undefined;
        }
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
