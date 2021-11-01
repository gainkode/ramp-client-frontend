import { Component, EventEmitter, Host, Input, Optional, Output, SkipSelf } from '@angular/core';
import { ControlContainer, FormControl } from '@angular/forms';

@Component({
    selector: 'app-form-searchbox',
    templateUrl: 'form-searchbox.component.html',
    styleUrls: ['../../../../assets/text-control.scss', '../../../../assets/button.scss']
})
export class FormSearchBoxComponent {
    @Input() maxlength = 0;
    @Input() formControl!: FormControl;
    @Input() formControlName!: string;
    @Output() onSearch = new EventEmitter();

    active = true;

    get control(): FormControl {
        return this.formControl || this.controlContainer.control?.get(this.formControlName);
    }

    constructor(
        @Optional() @Host() @SkipSelf()
        private controlContainer: ControlContainer) {
    }
    
    setDisabledState(isDisabled: boolean): void {
        this.active = !isDisabled;
    }
}
