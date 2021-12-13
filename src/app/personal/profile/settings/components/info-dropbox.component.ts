import { Component, EventEmitter, Input, OnDestroy, OnInit, Output, SkipSelf } from '@angular/core';
import { AbstractControl, ControlContainer, FormBuilder } from '@angular/forms';
import { Subscription } from 'rxjs';
import { CommonTargetValue } from 'src/app/model/common.model';

@Component({
    selector: 'app-profile-info-dropbox',
    templateUrl: './info-dropbox.component.html',
    styleUrls: [
        '../../../../../assets/menu.scss',
        '../../../../../assets/button.scss',
        '../../../../../assets/text-control.scss',
        '../../../../../assets/profile.scss',
    ],
    viewProviders: [{
        provide: ControlContainer,
        useFactory: (controlContainer: ControlContainer) => controlContainer,
        deps: [[new SkipSelf(), ControlContainer]]
    }]
})
export class ProfileInfoDropboxComponent implements OnInit, OnDestroy {
    @Input() label = '';
    @Input() required = false;
    @Input() set value(val: string | undefined) {
        this.autoChange = true;
        this.dataField?.setValue(val);
    }
    @Input() dataList: CommonTargetValue[] = [];
    @Output() onComplete = new EventEmitter<string>();

    dataForm = this.formBuilder.group({
        field: ['', { validators: [], updateOn: 'change' }]
    });

    private subscriptions: Subscription = new Subscription();
    private autoChange = false;

    get dataField(): AbstractControl | null {
        return this.dataForm.get('field');
    }

    get selectedValue(): CommonTargetValue | undefined {
        return this.dataList.find(x => x.id === this.dataField?.value);
    }

    constructor(private formBuilder: FormBuilder) { }

    ngOnInit(): void {
        this.subscriptions.add(
            this.dataField?.valueChanges.subscribe(data => {
                if (!this.autoChange) {
                    this.onComplete.emit(data);
                }
                this.autoChange = false;
            })
        );
    }

    ngOnDestroy(): void {
        this.subscriptions.unsubscribe();
    }
}
