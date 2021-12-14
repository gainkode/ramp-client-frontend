import { DatePipe } from '@angular/common';
import { ChangeDetectorRef, Component, ElementRef, EventEmitter, Input, OnDestroy, OnInit, Output, ViewChild } from '@angular/core';
import { AbstractControl, FormBuilder, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { getFormattedUtcDate } from 'src/app/utils/utils';

@Component({
    selector: 'app-profile-info-datebox',
    templateUrl: './info-datebox.component.html',
    styleUrls: [
        '../../../../assets/menu.scss',
        '../../../../assets/button.scss',
        '../../../../assets/text-control.scss',
        '../../../../assets/profile.scss',
    ]
})
export class ProfileInfoDateboxComponent implements OnInit, OnDestroy {
    @ViewChild('inputbox') inputBox: ElementRef | undefined = undefined;
    @Input() label = '';
    @Input() set value(val: Date | undefined) {
        this.init(val);
    }
    @Input() required = false;
    @Output() onComplete = new EventEmitter<Date | undefined>();

    editMode = false;
    formattedDate = '';
    months = [
        'January',
        'February',
        'March',
        'April',
        'May',
        'June',
        'July',
        'August',
        'September',
        'October',
        'November',
        'December'
    ];

    dataForm = this.formBuilder.group({
        field: ['', { validators: [], updateOn: 'change' }]
    });

    get dataField(): AbstractControl | null {
        return this.dataForm.get('field');
    }

    private date: Date | undefined = undefined;
    private datepipe: DatePipe = new DatePipe('en-US');
    //private subscriptions: Subscription = new Subscription();

    constructor(
        private changeDetector: ChangeDetectorRef,
        private formBuilder: FormBuilder,
        public dialog: MatDialog) {
    }

    ngOnInit(): void {

    }

    ngOnDestroy(): void {
        //this.subscriptions.unsubscribe();
    }

    private updateValidators(): void {
        const format = '^(3[01]|[12][0-9]|0?[1-9])/(1[0-2]|0?[1-9])/(?:[0-9]{2})?[0-9]{2}$';
        if (this.required) {
            this.dataField?.setValidators([Validators.required, Validators.pattern(format)]);
        } else {
            this.dataField?.setValidators([Validators.pattern(format)]);
        }
        this.dataField?.updateValueAndValidity();
    }

    private init(val: Date | undefined): void {
        this.setDate(val);
        this.updateValidators();
    }

    private setDate(val: Date | undefined): void {
        if (val) {
            this.date = new Date(val);
            const formattedDateValue = `${this.date.getDate()}/${this.date.getMonth() + 1}/${this.date.getFullYear()}`;
            this.dataField?.setValue(formattedDateValue);
            this.formattedDate = `${this.date.getDate()} ${this.months[this.date.getMonth()]} ${this.date.getFullYear()}`;
        } else {
            this.date = undefined;
            this.dataField?.setValue('');
            this.formattedDate = '';
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
            this.setDate(getFormattedUtcDate(this.dataField?.value ?? ''));
            this.onComplete.emit(this.date);
        }
    }
}
