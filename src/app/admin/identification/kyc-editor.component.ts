import { Component, ElementRef, ViewChild, Input, OnInit, Output, EventEmitter } from '@angular/core';
import { COMMA, ENTER } from '@angular/cdk/keycodes';
import { Validators, FormBuilder } from '@angular/forms';
import { Observable, of } from 'rxjs';
import { map, startWith } from 'rxjs/operators';
import { MatAutocompleteSelectedEvent, MatAutocomplete } from '@angular/material/autocomplete';
import { MatChipInputEvent } from '@angular/material/chips';
import { AccountIdFilterList } from '../../model/identification.model';
import {
    SettingsKycTargetFilterType, KycProvider, UserType, UserMode
} from '../../model/generated-models';
import {
    KycTargetFilterList, UserTypeList, UserModeList, KycProviderList
} from 'src/app/model/payment.model';
import { CommonTargetValue, TargetParams } from 'src/app/model/common.model';
import { CountryFilterList, getCountry } from 'src/app/model/country-code.model';
import { KycScheme } from 'src/app/model/identification.model';

@Component({
    selector: 'kyc-editor',
    templateUrl: 'kyc-editor.component.html',
    styleUrls: ['../admin.scss', 'identification.component.scss']
})
export class KycEditorComponent implements OnInit {
    @Input()
    set currentScheme(scheme: KycScheme | null) {
        this.setFormData(scheme);
        this.settingsId = (scheme !== null) ? scheme?.id : '';
    }
    @Input() create = false;
    @Output() save = new EventEmitter<KycScheme>();
    @Output() delete = new EventEmitter<string>();
    @Output() cancel = new EventEmitter();
    @Output() formChanged = new EventEmitter<boolean>();
    @ViewChild('targetValueInput') targetValueInput!: ElementRef<HTMLInputElement>;
    @ViewChild('auto') matAutocomplete!: MatAutocomplete;

    private defaultSchemeName = '';
    private settingsId = '';
    private loadingData = false;
    errorMessage = '';
    targetEntity = '';
    separatorKeysCodes: number[] = [ENTER, COMMA];
    filteredTargetValues: Observable<CommonTargetValue[]> | undefined;

    targets = KycTargetFilterList;
    userTypes = UserTypeList;
    userModes = UserModeList;
    providers = KycProviderList;

    schemeForm = this.formBuilder.group({
        id: [''],
        name: ['', { validators: [Validators.required], updateOn: 'change' }],
        description: [''],
        isDefault: [false],
        target: ['', { validators: [Validators.required], updateOn: 'change' }],
        targetValues: [[], { validators: [Validators.required], updateOn: 'change' }],
        targetValue: [''],
        userMode: [[], { validators: [Validators.required], updateOn: 'change' }],
        userType: [[], { validators: [Validators.required], updateOn: 'change' }],
        provider: [[], { validators: [Validators.required], updateOn: 'change' }]
    });

    get defaultSchemeFlag(): string {
        return this.defaultSchemeName;
    }

    get targetValueParams(): TargetParams {
        const val = this.schemeForm.get('target')?.value;
        const params = new TargetParams();
        switch (val) {
            case SettingsKycTargetFilterType.Country: {
                params.title = 'List of countries';
                params.inputPlaceholder = 'New country...';
                params.dataList = CountryFilterList;
                this.targetEntity = 'country';
                break;
            }
            case SettingsKycTargetFilterType.AccountId: {
                params.title = 'List of account identifiers';
                params.inputPlaceholder = 'New identifier...';
                params.dataList = AccountIdFilterList;
                this.targetEntity = 'account identifier';
                break;
            }
        }
        return params;
    }

    constructor(private formBuilder: FormBuilder) { }

    ngOnInit(): void {
        this.filteredTargetValues = of(this.filterTargetValues(''));
        this.schemeForm.valueChanges.subscribe({
            next: (result: any) => {
                if (!this.create && !this.loadingData) {
                    this.formChanged.emit(true);
                }
            }
        });
        this.schemeForm.get('target')?.valueChanges.subscribe(val => {
            this.clearTargetValues();
            this.filteredTargetValues = this.schemeForm.get('targetValue')?.valueChanges.pipe(
                startWith(''),
                map(value => this.filterTargetValues(value)));
        });
    }

    private filterTargetValues(value: string): CommonTargetValue[] {
        let filterValue = '';
        if (value) {
            filterValue = value.toLowerCase();
            return this.targetValueParams.dataList.filter(c => c.title.toLowerCase().includes(filterValue));
        } else {
            return this.targetValueParams.dataList;
        }
    }

    setFormData(scheme: KycScheme | null): void {
        this.schemeForm.reset();
        this.defaultSchemeName = '';
        if (scheme !== null) {
            this.loadingData = true;
            this.removeIncorrectTargetValues(scheme);
            this.defaultSchemeName = scheme.isDefault ? scheme.name : '';
            this.schemeForm.get('id')?.setValue(scheme?.id);
            this.schemeForm.get('name')?.setValue(scheme?.name);
            this.schemeForm.get('description')?.setValue(scheme?.description);
            this.schemeForm.get('isDefault')?.setValue(scheme?.isDefault);
            this.schemeForm.get('target')?.setValue(scheme?.target);
            this.schemeForm.get('targetValues')?.setValue(scheme?.targetValues);
            this.schemeForm.get('userMode')?.setValue(scheme.userModes);
            this.schemeForm.get('userType')?.setValue(scheme?.userTypes);
            this.schemeForm.get('provider')?.setValue(scheme?.kycProviders);
            this.loadingData = false;
            this.formChanged.emit(false);
        } else {
            this.schemeForm.get('id')?.setValue('');
            this.schemeForm.get('name')?.setValue('');
            this.schemeForm.get('description')?.setValue('');
            this.schemeForm.get('isDefault')?.setValue('');
            this.schemeForm.get('target')?.setValue('');
            this.schemeForm.get('targetValues')?.setValue([]);
            this.schemeForm.get('userMode')?.setValue('');
            this.schemeForm.get('userType')?.setValue('');
            this.schemeForm.get('provider')?.setValue('');
        }
    }

    setSchemeData(): KycScheme {
        const data = new KycScheme(null);
        // common
        data.name = this.schemeForm.get('name')?.value;
        data.description = this.schemeForm.get('description')?.value;
        data.isDefault = this.schemeForm.get('isDefault')?.value;
        data.id = this.schemeForm.get('id')?.value;
        // target
        data.setTarget(this.schemeForm.get('target')?.value, this.schemeForm.get('targetValues')?.value);
        (this.schemeForm.get('userMode')?.value as UserMode[]).forEach(x => data.userModes.push(x));
        (this.schemeForm.get('userType')?.value as UserType[]).forEach(x => data.userTypes.push(x));
        (this.schemeForm.get('provider')?.value as KycProvider[]).forEach(x => data.kycProviders.push(x));
        return data;
    }

    addTargetValue(event: MatChipInputEvent): void {
        const input = event.input;
        const value = event.value;
        // Add new target value
        if ((value || '').trim()) {
            const values = this.schemeForm.get('targetValues')?.value;
            values.push(value.trim());
            this.schemeForm.get('targetValues')?.setValue(values);
        }
        // Reset the input value
        if (input) {
            input.value = '';
        }
        this.schemeForm.get('targetValue')?.setValue(null);
    }

    removeTargetValue(val: string): void {
        const values = this.schemeForm.get('targetValues')?.value;
        const index = values.indexOf(val);
        if (index >= 0) {
            values.splice(index, 1);
            this.schemeForm.get('targetValues')?.setValue(values);
        }
    }

    clearTargetValues(): void {
        this.schemeForm.get('targetValues')?.setValue([]);
    }

    targetItemSelected(event: MatAutocompleteSelectedEvent): void {
        const values = this.schemeForm.get('targetValues')?.value;
        if (!values.includes(event.option.viewValue)) {
            values.push(event.option.viewValue);
            this.schemeForm.get('targetValues')?.setValue(values);
        }
        this.targetValueInput.nativeElement.value = '';
        this.schemeForm.get('targetValue')?.setValue(null);
    }

    onDeleteScheme(): void {
        this.delete.emit(this.settingsId);
    }

    private removeIncorrectTargetValues(scheme: KycScheme): void {
        scheme.targetValues = scheme.targetValues.filter(val => {
            let result = true;
            if (scheme.target === SettingsKycTargetFilterType.Country) {
                const c = getCountry(val);
                result = (c !== null);
            }
            return result;
        });
    }

    private validateTargetValues(): boolean {
        let result = true;
        const filter = this.schemeForm.get('target')?.value as SettingsKycTargetFilterType;
        if (filter === SettingsKycTargetFilterType.Country) {
            (this.schemeForm.get('targetValues')?.value as string[]).every(x => {
                const c = getCountry(x);
                if (c === null) {
                    result = false;
                    this.errorMessage = `Country ${x} is not found in a list`;
                    return false;
                }
                return true;
            });
        }
        return result;
    }

    onSubmit(): void {
        if (this.schemeForm.valid && this.validateTargetValues()) {
            this.save.emit(this.setSchemeData());
        } else {
            this.errorMessage = 'Input data is not completely valid. Please, check all fields are valid.';
        }
    }

    onCancel(): void {
        this.cancel.emit();
    }
}
