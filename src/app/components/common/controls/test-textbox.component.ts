import { Component, forwardRef, Host, Input, OnInit, Optional, SkipSelf, ViewChild } from '@angular/core';
import { AbstractControl, ControlContainer, ControlValueAccessor, FormControl, FormControlDirective, NG_VALIDATORS, NG_VALUE_ACCESSOR, Validator } from '@angular/forms';

@Component({
    selector: 'resettable-input',
    template: `
       <input type="text" [formControl]="control">
       <button (click)="clearInput()">clear</button>
       <div *ngIf="control?.valid===false && initialized">Error</div>
    `,
    providers: [{
        provide: NG_VALUE_ACCESSOR,
        useExisting: TestTextBoxComponent,
        multi: true
    }]
})
export class TestTextBoxComponent implements ControlValueAccessor, OnInit {

    @ViewChild(FormControlDirective, { static: true })
    formControlDirective!: FormControlDirective;
    @Input() formControl!: FormControl;
    @Input() formControlName!: string;

    initialized = false;

    /* get hold of FormControl instance no matter formControl or    formControlName is given. If formControlName is given, then this.controlContainer.control is the parent FormGroup (or FormArray) instance. */
    get control() {
        return this.formControl || this.controlContainer.control?.get(this.formControlName);
    }

    constructor(
        @Optional() @Host() @SkipSelf()
        private controlContainer: ControlContainer) {
    }

    ngOnInit(): void {
        this.control.valueChanges.subscribe(val => {
            this.initialized = true;
        });
    }

    clearInput() {
        this.control.setValue('');
    }

    registerOnTouched(fn: any): void {
        this.formControlDirective.valueAccessor?.registerOnTouched(fn);
    }

    registerOnChange(fn: any): void {
        this.formControlDirective.valueAccessor?.registerOnChange(fn);
    }

    writeValue(obj: any): void {
        console.log('write', obj);
        this.formControlDirective.valueAccessor?.writeValue(obj);
    }

    setDisabledState(isDisabled: boolean): void {
        // if (this.formControlDirective.valueAccessor !== null) {
        //     const v = this.formControlDirective.valueAccessor as ControlValueAccessor;
        //     v.setDisabledState(isDisabled);
        // }
    }
}