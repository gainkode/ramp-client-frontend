import { Component, Host, Input, OnDestroy, OnInit, Optional, SkipSelf, ViewChild } from '@angular/core';
import { AbstractControl, ControlContainer, ControlValueAccessor, FormControl, FormControlDirective, NG_VALUE_ACCESSOR, Validators } from '@angular/forms';
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
    @Input() asterisk = false;
    @Input() assist = '';
    @Input() boxType = '';
    @Input() placeholder = '';
    @Input() inputMask = '';
    @Input() maxlength = 0;
    @Input() errorMessages: { [key: string]: string } = {};
    @Input() formControl!: FormControl;
    @Input() formControlName!: string;
    @Input() numberField = false;
    @Input() inputMode = 'text';
    @Input() inputPattern = '';
    @Input() multiple = false;
    @Input() upperCase = false;
    @Input() separator = false;

    private subscriptions: Subscription = new Subscription();
    initialized = false;
    active = true;
    errorMessage = '';
    requiredFlag = false;

    get control(): FormControl {
        this.requiredFlag = false;
        const c = this.formControl || this.controlContainer.control?.get(this.formControlName);
        if (c && c.validator) {
            const validator = c.validator({} as AbstractControl);
            if (validator && validator.required) {
                this.requiredFlag = true;
            }
        }
        return c;
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
        this.subscriptions.add(
            this.control?.valueChanges.subscribe(val => {
                this.initialized = true;
                this.errorMessage = this.getError();
            })
        );
    }

    ngOnDestroy(): void {
        this.subscriptions.unsubscribe();
    }

    registerOnTouched(fn: any): void {
        if (this.formControlDirective) {
            this.formControlDirective.valueAccessor?.registerOnTouched(fn);
        }
    }

    registerOnChange(fn: any): void {
        if (this.formControlDirective) {
            this.formControlDirective.valueAccessor?.registerOnChange(fn);
        }
    }

    writeValue(obj: any): void {
        if (this.formControlDirective) {
            this.formControlDirective.valueAccessor?.writeValue(obj);
        }
    }

    setDisabledState(isDisabled: boolean): void {
        this.active = !isDisabled;
    }
}
