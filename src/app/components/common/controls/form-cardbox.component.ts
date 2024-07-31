import { Component, Host, Input, OnDestroy, OnInit, Optional, SkipSelf, ViewChild } from '@angular/core';
import { ControlContainer, ControlValueAccessor, FormControl, FormControlDirective, NG_VALUE_ACCESSOR, UntypedFormControl } from '@angular/forms';
import { Subscription } from 'rxjs';

@Component({
	selector: 'app-form-cardbox',
	templateUrl: 'form-cardbox.component.html',
	styleUrls: ['../../../../assets/text-control.scss'],
	providers: [{
		provide: NG_VALUE_ACCESSOR,
		useExisting: FormCardBoxComponent,
		multi: true
	}]
})
export class FormCardBoxComponent implements ControlValueAccessor, OnInit, OnDestroy {
    @ViewChild(FormControlDirective, { static: true })
    formControlDirective!: FormControlDirective;
    @Input() label = '';
    @Input() assist = '';
    @Input() placeholder = '';
    @Input() maxlength = 0;
    @Input() errorMessages: { [key: string]: string; } = {};
    @Input() formControl!: UntypedFormControl;
    @Input() formControlName!: string;
    @Input() img = '';
    @Input() separator = false;

    private subscriptions: Subscription = new Subscription();
    initialized = false;
    active = true;

    errorMessage = '';

    get control(): UntypedFormControl {
    	return (this.formControl || this.controlContainer.control?.get(this.formControlName)) as FormControl;
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
    		this.control?.valueChanges.subscribe(() => {
    			this.initialized = true;
    			this.errorMessage = this.getError();
    		})
    	);
    }

    ngOnDestroy(): void {
    	this.subscriptions.unsubscribe();
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
