import { AfterViewInit, Component, ElementRef, EventEmitter, Host, Input, Optional, Output, SkipSelf, ViewChild } from '@angular/core';
import { ControlContainer, ControlValueAccessor, UntypedFormControl, FormControlDirective, NG_VALUE_ACCESSOR, FormControl } from '@angular/forms';

@Component({
	selector: 'app-form-editbox',
	templateUrl: 'form-editbox.component.html',
	styleUrls: ['../../../../assets/text-control.scss'],
	providers: [{
		provide: NG_VALUE_ACCESSOR,
		useExisting: FormEditBoxComponent,
		multi: true
	}]
})
export class FormEditBoxComponent implements ControlValueAccessor, AfterViewInit {
    @ViewChild('inputbox') inputBox: ElementRef | undefined = undefined;
    @ViewChild(FormControlDirective, { static: true })
    formControlDirective!: FormControlDirective;
    @Input() maxlength = 0;
    @Input() formControl!: UntypedFormControl;
    @Input() formControlName!: string;
    @Output() onSubmit = new EventEmitter();

    active = true;

    get control(): UntypedFormControl {
        return (this.formControl || this.controlContainer.control?.get(this.formControlName)) as FormControl;
    }

    constructor(
        @Optional() @Host() @SkipSelf()
        private controlContainer: ControlContainer) {
    }

    ngAfterViewInit(): void {
        const focusInput = this.inputBox?.nativeElement as HTMLInputElement;
        if (focusInput !== undefined) {
            setTimeout(() => {
                focusInput?.focus();
            }, 100);
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
