import { AfterViewInit, Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { AbstractControl, FormBuilder, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';

@Component({
    selector: 'app-profile-info-textbox',
    templateUrl: './info-textbox.component.html',
    styleUrls: [
        '../../../../../assets/menu.scss',
        '../../../../../assets/button.scss',
        '../../../../../assets/text-control.scss',
        '../../../../../assets/profile.scss',
    ]
})
export class ProfileInfoTextboxComponent implements OnInit, AfterViewInit {
    @Input() editable = true;
    @Input() label = '';
    @Input() set value(val: string) {
        this.init(val);
    }
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

    ngAfterViewInit(): void {
        
    }

    ngOnInit(): void {
        
    }

    private init(val: string): void {
        this.dataField?.setValue(val);
        if (this.required) {
            this.dataField?.setValidators([Validators.required]);
            this.dataField?.updateValueAndValidity();
        }
    }

    edit(): void {
        if (this.editMode) {
            this.onComplete.emit(this.dataField?.value ?? '');
        }
        this.editMode = !this.editMode;
    }
}
