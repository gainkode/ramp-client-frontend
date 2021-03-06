import { Component, ElementRef, ViewChild, Input, OnInit, Output, EventEmitter } from '@angular/core';
import { COMMA, ENTER } from '@angular/cdk/keycodes';
import { Validators, FormBuilder } from '@angular/forms';
import { Observable } from 'rxjs';
import { map, startWith } from 'rxjs/operators';
import { MatAutocompleteSelectedEvent, MatAutocomplete } from '@angular/material/autocomplete';
import { MatChipInputEvent } from '@angular/material/chips';
import {
    TargetParams, CommonTargetValue, FeeScheme,
    AccountTypeFilterList, CountryFilterList, AffiliateIdFilterList, AccountIdFilterList, WidgetFilterList,
    PaymentInstrumentList, TransactionTypeList, TargetFilterList, PaymentProviderList
} from '../../model/fee-scheme.model';
import {
    FeeSettingsTargetFilterType, PaymentInstrument, PaymentProvider, TransactionType
} from '../../model/generated-models';

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
    @ViewChild('targetValueInput') targetValueInput!: ElementRef<HTMLInputElement>;
    @ViewChild('auto') matAutocomplete!: MatAutocomplete;

    private defaultSchemeName = '';
    private settingsId = '';
    private forceValidate = false;
    selectedTab = 0;
    targetValues: string[] = [];
    separatorKeysCodes: number[] = [ENTER, COMMA];
    filteredTargetValues: Observable<CommonTargetValue[]> | undefined;

    targets = TargetFilterList;
    transactionTypes = TransactionTypeList;
    instruments = PaymentInstrumentList;
    providers = PaymentProviderList;

    schemeForm = this.formBuilder.group({
        id: [''],
        name: ['', { validators: [Validators.required], updateOn: 'change' }],
        description: ['', { validators: [Validators.required], updateOn: 'change' }],
        isDefault: [false],
        target: ['', { validators: [Validators.required], updateOn: 'change' }],
        targetValues: [''],
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
                break;
            }
            case FeeSettingsTargetFilterType.Country: {
                params.title = 'List of countries';
                params.inputPlaceholder = 'New country...';
                params.dataList = CountryFilterList;
                break;
            }
            case FeeSettingsTargetFilterType.AccountId: {
                params.title = 'List of account identifiers';
                params.inputPlaceholder = 'New identifier...';
                params.dataList = AccountIdFilterList;
                break;
            }
            case FeeSettingsTargetFilterType.AccountType: {
                params.title = 'List of account types';
                params.inputPlaceholder = 'New account type...';
                params.dataList = AccountTypeFilterList;
                break;
            }
            case FeeSettingsTargetFilterType.InitiateFrom: {
                params.title = 'List of widgets';
                params.inputPlaceholder = 'New widget...';
                params.dataList = WidgetFilterList;
                break;
            }
        }
        return params;
    }

    constructor(private formBuilder: FormBuilder) { }

    ngOnInit(): void {
        this.schemeForm.get('target')?.valueChanges.subscribe(val => {
            this.clearTargetValues();
            this.filteredTargetValues = this.schemeForm.get('targetValues')?.valueChanges.pipe(
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
            this.defaultSchemeName = scheme.isDefault ? scheme.name : '';
            this.schemeForm.get('id')?.setValue(scheme?.id);
            this.schemeForm.get('name')?.setValue(scheme?.name);
            this.schemeForm.get('description')?.setValue(scheme?.description);
            this.schemeForm.get('isDefault')?.setValue(scheme?.isDefault);
            this.schemeForm.get('target')?.setValue(scheme?.target);
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
            scheme?.targetValues.forEach(x => this.targetValues.push(x));
        } else {
            this.schemeForm.get('id')?.setValue('');
            this.schemeForm.get('name')?.setValue('');
            this.schemeForm.get('description')?.setValue('');
            this.schemeForm.get('isDefault')?.setValue('');
            this.schemeForm.get('target')?.setValue('');
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
            this.targetValues = [];
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
        data.setTarget(this.schemeForm.get('target')?.value, this.targetValues);
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
            this.targetValues.push(value.trim());
        }
        // Reset the input value
        if (input) {
            input.value = '';
        }
        this.schemeForm.get('targetValues')?.setValue(null);
    }

    removeTargetValue(val: string) {
        const index = this.targetValues.indexOf(val);
        if (index >= 0) {
            this.targetValues.splice(index, 1);
        }
    }

    clearTargetValues() {
        this.targetValues.splice(0, this.targetValues.length);
    }

    targetItemSelected(event: MatAutocompleteSelectedEvent): void {
        if (!this.targetValues.includes(event.option.viewValue)) {
            this.targetValues.push(event.option.viewValue);
        }
        this.targetValueInput.nativeElement.value = '';
        this.schemeForm.get('targetValues')?.setValue(null);
    }

    onDeleteScheme(): void {
        this.delete.emit(this.settingsId);
    }

    onSubmit(): void {
        this.forceValidate = true;
        if (this.schemeForm.valid) {
            this.save.emit(this.setSchemeData());
        }
    }

    onCancel(): void {
        this.cancel.emit();
    }
}
