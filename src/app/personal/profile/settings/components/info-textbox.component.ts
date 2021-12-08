import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { AbstractControl, FormBuilder, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';

@Component({
    selector: 'app-profile-info-textbox',
    templateUrl: './info-textbox.component.html',
    styleUrls: [
        '../../../../../assets/menu.scss',
        '../../../../../assets/button.scss',
        '../../../../../assets/text-control.scss',
        '../../../../../assets/profile.scss'
    ]
})
export class ProfileInfoTextboxComponent implements OnInit {
    @Input() label = '';
    @Input() value = '';
    @Input() required = '';
    @Output() onComplete = new EventEmitter<string>();

    editMode = false;

    dataForm = this.formBuilder.group({
        field: ['', { validators: [], updateOn: 'change' }]
    });

    get dataField(): AbstractControl | null {
        return this.dataForm.get('field');
    }

    constructor(
        private formBuilder: FormBuilder,
        public dialog: MatDialog) {
    }

    ngOnInit(): void {
        if (this.required) {
            this.dataField?.setValidators([Validators.required]);
            this.dataField?.updateValueAndValidity();
        }
    }

    onSubmit(): void {
        this.onComplete.emit(this.dataField?.value ?? '');
    }
}
