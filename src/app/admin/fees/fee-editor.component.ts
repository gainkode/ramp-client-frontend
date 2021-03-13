import { Component, ElementRef, ViewChild, Input, OnInit, Output, EventEmitter } from '@angular/core';
import { COMMA, ENTER } from '@angular/cdk/keycodes';
import { Validators, FormBuilder } from '@angular/forms';
import { Observable, of } from 'rxjs';
import { map, startWith } from 'rxjs/operators';
import { MatAutocompleteSelectedEvent, MatAutocomplete } from '@angular/material/autocomplete';
import { MatChipInputEvent } from '@angular/material/chips';
import {
    FeeScheme, AccountTypeFilterList, CountryFilterList, AffiliateIdFilterList,
    AccountIdFilterList, WidgetFilterList
} from '../../model/fee-scheme.model';
import {
    FeeSettingsTargetFilterType, PaymentInstrument, PaymentProvider, TransactionType
} from '../../model/generated-models';
import {
    PaymentInstrumentList, PaymentProviderList, FeeTargetFilterList, TransactionTypeList
} from 'src/app/model/payment.model';
import { CommonTargetValue, TargetParams } from 'src/app/model/common.model';
import { getCountry } from 'src/app/model/country-code.model';

@Component({
    selector: 'fee-editor',
    templateUrl: 'fee-editor.component.html',
    styleUrls: ['../admin.scss', 'fees.component.scss']
})
export class FeeEditorComponent implements OnInit {
    @Input()
    set currentScheme(scheme: FeeScheme | null) {
        this.forceValidate = false;
        this.setFormData(scheme);
        this.settingsId = (scheme !== null) ? scheme?.id : '';
    }
    @Input() create: boolean = false;
    @Output() save = new EventEmitter<FeeScheme>();
    @Output() delete = new EventEmitter<string>();
    @Output() cancel = new EventEmitter();
    @Output() formChanged = new EventEmitter<boolean>();
    @ViewChild('targetValueInput') targetValueInput!: ElementRef<HTMLInputElement>;
    @ViewChild('auto') matAutocomplete!: MatAutocomplete;

    private defaultSchemeName = '';
    private settingsId = '';
    private forceValidate = false;
    private loadingData = false;
    errorMessage = '';
    selectedTab = 0;
    targetEntity = '';
    separatorKeysCodes: number[] = [ENTER, COMMA];
    filteredTargetValues: Observable<CommonTargetValue[]> | undefined;

    targets = FeeTargetFilterList;
    transactionTypes = TransactionTypeList;
    instruments = PaymentInstrumentList;
    providers = PaymentProviderList;

    schemeForm = this.formBuilder.group({
        id: [''],
        name: ['', { validators: [Validators.required], updateOn: 'change' }],
        description: ['', { validators: [Validators.required], updateOn: 'change' }],
        isDefault: [false],
        target: ['', { validators: [Validators.required], updateOn: 'change' }],
        targetValues: [[], { validators: [Validators.required], updateOn: 'change' }],
        targetValue: [''],
        instrument: [[], { validators: [Validators.required], updateOn: 'change' }],
        trxType: [[], { validators: [Validators.required], updateOn: 'change' }],
        provider: [[], { validators: [Validators.required], updateOn: 'change' }],
        transactionFees: ['',
            { validators: [Validators.required, Validators.min(0), Validators.max(100)], updateOn: 'change' }],
        minTransactionFee: ['',
            { validators: [Validators.required, Validators.min(0), Validators.max(1000)], updateOn: 'change' }],
        rollingReserves: ['',
            { validators: [Validators.required, Validators.min(0), Validators.max(10000)], updateOn: 'change' }],
        rollingReservesDays: ['',
            { validators: [Validators.required, Validators.min(0), Validators.max(365)], updateOn: 'change' }],
        chargebackFees: ['',
            { validators: [Validators.required, Validators.min(0), Validators.max(100)], updateOn: 'change' }],
        monthlyFees: ['',
            { validators: [Validators.required, Validators.min(0), Validators.max(100)], updateOn: 'change' }],
        minMonthlyFees: ['',
            { validators: [Validators.required, Validators.min(0), Validators.max(100)], updateOn: 'change' }],
        beneficiaryName: ['', { validators: [Validators.required], updateOn: 'change' }],
        beneficiaryAddress: ['', { validators: [Validators.required], updateOn: 'change' }],
        iban: ['', { validators: [Validators.required], updateOn: 'change' }],
        bankName: ['', { validators: [Validators.required], updateOn: 'change' }],
        bankAddress: ['', { validators: [Validators.required], updateOn: 'change' }],
        swift: ['', { validators: [Validators.required], updateOn: 'change' }]
    });

    get defaultSchemeFlag(): string {
        return this.defaultSchemeName;
    }

    get targetValueParams(): TargetParams {
        const val = this.schemeForm.get('target')?.value;
        let params = new TargetParams();
        switch (val) {
            case FeeSettingsTargetFilterType.AffiliateId: {
                params.title = 'List of affiliate identifiers';
                params.inputPlaceholder = 'New identifier...';
                params.dataList = AffiliateIdFilterList;
                this.targetEntity = 'affiliate identifier';
                break;
            }
            case FeeSettingsTargetFilterType.Country: {
                params.title = 'List of countries';
                params.inputPlaceholder = 'New country...';
                params.dataList = CountryFilterList;
                this.targetEntity = 'country';
                break;
            }
            case FeeSettingsTargetFilterType.AccountId: {
                params.title = 'List of account identifiers';
                params.inputPlaceholder = 'New identifier...';
                params.dataList = AccountIdFilterList;
                this.targetEntity = 'account identifier';
                break;
            }
            case FeeSettingsTargetFilterType.AccountType: {
                params.title = 'List of account types';
                params.inputPlaceholder = 'New account type...';
                params.dataList = AccountTypeFilterList;
                this.targetEntity = 'account type';
                break;
            }
            case FeeSettingsTargetFilterType.InitiateFrom: {
                params.title = 'List of widgets';
                params.inputPlaceholder = 'New widget...';
                params.dataList = WidgetFilterList;
                this.targetEntity = 'widget';
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

    setFormData(scheme: FeeScheme | null): void {
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
            this.schemeForm.get('instrument')?.setValue(scheme.instrument);
            this.schemeForm.get('trxType')?.setValue(scheme?.trxType);
            this.schemeForm.get('provider')?.setValue(scheme?.provider);
            this.schemeForm.get('transactionFees')?.setValue(scheme?.terms.transactionFees);
            this.schemeForm.get('minTransactionFee')?.setValue(scheme?.terms.minTransactionFee);
            this.schemeForm.get('rollingReserves')?.setValue(scheme?.terms.rollingReserves);
            this.schemeForm.get('rollingReservesDays')?.setValue(scheme?.terms.rollingReservesDays);
            this.schemeForm.get('chargebackFees')?.setValue(scheme?.terms.chargebackFees);
            this.schemeForm.get('monthlyFees')?.setValue(scheme?.terms.monthlyFees);
            this.schemeForm.get('minMonthlyFees')?.setValue(scheme?.terms.minMonthlyFees);
            this.schemeForm.get('beneficiaryName')?.setValue(scheme?.details.beneficiaryName);
            this.schemeForm.get('beneficiaryAddress')?.setValue(scheme?.details.beneficiaryAddress);
            this.schemeForm.get('iban')?.setValue(scheme?.details.iban);
            this.schemeForm.get('bankName')?.setValue(scheme?.details.bankName);
            this.schemeForm.get('bankAddress')?.setValue(scheme?.details.bankAddress);
            this.schemeForm.get('swift')?.setValue(scheme?.details.swift);
            this.loadingData = false;
            this.formChanged.emit(false);
        } else {
            this.schemeForm.get('id')?.setValue('');
            this.schemeForm.get('name')?.setValue('');
            this.schemeForm.get('description')?.setValue('');
            this.schemeForm.get('isDefault')?.setValue('');
            this.schemeForm.get('target')?.setValue('');
            this.schemeForm.get('targetValues')?.setValue([]);
            this.schemeForm.get('instrument')?.setValue('');
            this.schemeForm.get('trxType')?.setValue('');
            this.schemeForm.get('provider')?.setValue('');
            this.schemeForm.get('transactionFees')?.setValue('');
            this.schemeForm.get('minTransactionFee')?.setValue('');
            this.schemeForm.get('rollingReserves')?.setValue('');
            this.schemeForm.get('rollingReservesDays')?.setValue('');
            this.schemeForm.get('chargebackFees')?.setValue('');
            this.schemeForm.get('monthlyFees')?.setValue('');
            this.schemeForm.get('minMonthlyFees')?.setValue('');
            this.schemeForm.get('beneficiaryName')?.setValue('');
            this.schemeForm.get('beneficiaryAddress')?.setValue('');
            this.schemeForm.get('iban')?.setValue('');
            this.schemeForm.get('bankName')?.setValue('');
            this.schemeForm.get('bankAddress')?.setValue('');
            this.schemeForm.get('swift')?.setValue('');
        }
    }

    setSchemeData(): FeeScheme {
        let data = new FeeScheme(null);
        // common
        data.name = this.schemeForm.get('name')?.value;
        data.description = this.schemeForm.get('description')?.value;
        data.isDefault = this.schemeForm.get('isDefault')?.value;
        data.id = this.schemeForm.get('id')?.value;
        // target
        data.setTarget(this.schemeForm.get('target')?.value, this.schemeForm.get('targetValues')?.value);
        (this.schemeForm.get('instrument')?.value as PaymentInstrument[]).forEach(x => data.instrument.push(x));
        (this.schemeForm.get('trxType')?.value as TransactionType[]).forEach(x => data.trxType.push(x));
        (this.schemeForm.get('provider')?.value as PaymentProvider[]).forEach(x => data.provider.push(x));
        // terms
        data.terms.transactionFees = this.schemeForm.get('transactionFees')?.value;
        data.terms.minTransactionFee = this.schemeForm.get('minTransactionFee')?.value;
        data.terms.rollingReserves = this.schemeForm.get('rollingReserves')?.value;
        data.terms.rollingReservesDays = this.schemeForm.get('rollingReservesDays')?.value;
        data.terms.chargebackFees = this.schemeForm.get('chargebackFees')?.value;
        data.terms.monthlyFees = this.schemeForm.get('monthlyFees')?.value;
        data.terms.minMonthlyFees = this.schemeForm.get('minMonthlyFees')?.value;
        // wire details
        data.details.beneficiaryName = this.schemeForm.get('beneficiaryName')?.value;
        data.details.beneficiaryAddress = this.schemeForm.get('beneficiaryAddress')?.value;
        data.details.iban = this.schemeForm.get('iban')?.value;
        data.details.bankName = this.schemeForm.get('bankName')?.value;
        data.details.bankAddress = this.schemeForm.get('bankAddress')?.value;
        data.details.swift = this.schemeForm.get('swift')?.value;
        return data;
    }

    private validateField(name: string): boolean {
        let valid = true;
        if (this.schemeForm.get(name)?.touched || this.forceValidate) {
            valid = this.schemeForm.get(name)?.valid as boolean;
        }
        return valid;
    }

    tabHasError(tab: string): boolean {
        let valid: boolean | undefined = true;
        if (tab == 'tab1') {
            valid = this.validateField('target');
            if (valid) valid = this.validateField('targetValues');
            if (valid) valid = this.validateField('instrument');
            if (valid) valid = this.validateField('trxType');
            if (valid) valid = this.validateField('provider');
            if (valid) valid = (this.errorMessage === '');
        } else if (tab == 'tab2') {
            valid = this.validateField('transactionFees');
            if (valid) valid = this.validateField('minTransactionFee');
            if (valid) valid = this.validateField('rollingReserves');
            if (valid) valid = this.validateField('rollingReservesDays');
            if (valid) valid = this.validateField('chargebackFees');
            if (valid) valid = this.validateField('monthlyFees');
            if (valid) valid = this.validateField('minMonthlyFees');
        } else if (tab == 'tab3') {
            valid = this.validateField('beneficiaryName');
            if (valid) valid = this.validateField('beneficiaryAddress');
            if (valid) valid = this.validateField('iban');
            if (valid) valid = this.validateField('bankName');
            if (valid) valid = this.validateField('bankAddress');
            if (valid) valid = this.validateField('swift');
        }
        return valid !== true;
    }

    setSelectedTab(index: number): void {
        this.selectedTab = index;
    }

    addTargetValue(event: MatChipInputEvent): void {
        const input = event.input;
        const value = event.value;
        // Add new target value
        if ((value || '').trim()) {
            let values = this.schemeForm.get('targetValues')?.value;
            values.push(value.trim());
            this.schemeForm.get('targetValues')?.setValue(values);
        }
        // Reset the input value
        if (input) {
            input.value = '';
        }
        this.schemeForm.get('targetValue')?.setValue(null);
    }

    removeTargetValue(val: string) {
        let values = this.schemeForm.get('targetValues')?.value;
        const index = values.indexOf(val);
        if (index >= 0) {
            values.splice(index, 1);
            this.schemeForm.get('targetValues')?.setValue(values);
        }
    }

    clearTargetValues() {
        this.schemeForm.get('targetValues')?.setValue([]);
    }

    targetItemSelected(event: MatAutocompleteSelectedEvent): void {
        let values = this.schemeForm.get('targetValues')?.value;
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

    private removeIncorrectTargetValues(scheme: FeeScheme): void {
        scheme.targetValues = scheme.targetValues.filter(val => {
            let result = true;
            if (scheme.target == FeeSettingsTargetFilterType.Country) {
                const c = getCountry(val);
                result = (c !== null);
            } else if (scheme.target == FeeSettingsTargetFilterType.AccountType) {
                const c = AccountTypeFilterList.find(x => x.title.toLowerCase() === val.toLowerCase());
                result = (c !== undefined);
            }
            return result;
        });
    }

    private validateTargetValues(): boolean {
        let result = true;
        const filter = this.schemeForm.get('target')?.value as FeeSettingsTargetFilterType;
        if (filter == FeeSettingsTargetFilterType.Country) {
            (this.schemeForm.get('targetValues')?.value as string[]).every(x => {
                const c = getCountry(x);
                if (c === null) {
                    result = false;
                    this.errorMessage = `Country ${x} is not found in a list`;
                    this.selectedTab = 0;
                    return false;
                }
                return true;
            });
        } else if (filter == FeeSettingsTargetFilterType.AccountType) {
            (this.schemeForm.get('targetValues')?.value as string[]).every(x => {
                const c = AccountTypeFilterList.find(t => t.title.toLowerCase() === x.toLowerCase());
                if (c === undefined) {
                    result = false;
                    this.errorMessage = `Account type ${x} is not valid`;
                    this.selectedTab = 0;
                    return false;
                }
                return true;
            });
        }
        return result;
    }

    onSubmit(): void {
        this.forceValidate = true;
        if (this.schemeForm.valid && this.validateTargetValues()) {
            this.save.emit(this.setSchemeData());
        }
    }

    onCancel(): void {
        this.cancel.emit();
    }
}
