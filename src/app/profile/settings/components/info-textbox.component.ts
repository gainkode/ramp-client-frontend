import { ChangeDetectorRef, Component, ElementRef, EventEmitter, Input, Output, ViewChild } from '@angular/core';
import { AbstractControl, UntypedFormBuilder, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';

@Component({
	selector: 'app-profile-info-textbox',
	templateUrl: './info-textbox.component.html',
	styleUrls: [
		'../../../../assets/menu.scss',
		'../../../../assets/button.scss',
		'../../../../assets/text-control.scss',
		'../../../../assets/profile.scss',
	]
})
export class ProfileInfoTextboxComponent {
    @ViewChild('inputbox') inputBox: ElementRef | undefined = undefined;
    @Input() editable = true;
    @Input() label = '';
    @Input() set value(val: string) {
    	this.init(val);
    }
    @Input() required = false;
    @Output() onComplete = new EventEmitter<string>();

    editMode = false;

    dataForm = this.formBuilder.group({
    	field: ['', { validators: [], updateOn: 'change' }]
    });

    get dataField(): AbstractControl | null {
    	return this.dataForm.get('field');
    }

    constructor(
    	private changeDetector : ChangeDetectorRef,
    	private formBuilder: UntypedFormBuilder,
    	public dialog: MatDialog) {
    }

    private init(val: string): void {
    	this.dataField?.setValue(val);
    	if (this.required) {
    		this.dataField?.setValidators([Validators.required]);
    		this.dataField?.updateValueAndValidity();
    	}
    }

    edit(): void {
    	this.editMode = !this.editMode;
    	this.changeDetector.detectChanges();
    	if (this.editMode) {
    		if (this.inputBox) {
    			setTimeout(() => {
    				this.inputBox?.nativeElement.focus();
    			}, 100);
    		}            
    	} else {
    		this.onComplete.emit(this.dataField?.value ?? '');
    	}
    }
}
