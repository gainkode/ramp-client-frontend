import { Component, ElementRef, ViewChild, Input, OnInit, Output, EventEmitter } from '@angular/core';
import { COMMA, ENTER } from '@angular/cdk/keycodes';
import { Validators, FormBuilder } from '@angular/forms';
import { Observable } from 'rxjs';
import { map, startWith } from 'rxjs/operators';
import { MatAutocompleteSelectedEvent, MatAutocomplete } from '@angular/material/autocomplete';
import { MatChipInputEvent } from '@angular/material/chips';
import { CostScheme, PspFilterList } from '../../model/cost-scheme.model';
import {
    CostSettingsFilterType, PaymentInstrument, PaymentProvider, TransactionType
} from '../../model/generated-models';
import { PaymentInstrumentList, PaymentProviderList, TransactionTypeList, CostTargetFilterList } from 'src/app/model/payment.model';
import { CommonTargetValue, TargetParams } from 'src/app/model/common.model';
import { CountryFilterList } from 'src/app/model/fee-scheme.model';

@Component({
    selector: 'cost-editor',
    templateUrl: 'cost-editor.component.html',
    styleUrls: ['../admin.scss', 'costs.component.scss']
})
export class CostEditorComponent implements OnInit {
    @Input()
    set currentScheme(scheme: CostScheme | null) {
        this.forceValidate = false;
        this.setFormData(scheme);
        this.settingsId = (scheme !== null) ? scheme?.id : '';
    }
    @Input() create: boolean = false;
    @Output() save = new EventEmitter<CostScheme>();
    @Output() delete = new EventEmitter<string>();
    @Output() cancel = new EventEmitter();
    @Output() formChanged = new EventEmitter<boolean>();
    @ViewChild('targetValueInput') targetValueInput!: ElementRef<HTMLInputElement>;
    @ViewChild('auto') matAutocomplete!: MatAutocomplete;

    private defaultSchemeName = '';
    private settingsId = '';
    private forceValidate = false;
    private loadingData = false;
    selectedTab = 0;
    targetValues: string[] = [];
    separatorKeysCodes: number[] = [ENTER, COMMA];
    filteredTargetValues: Observable<CommonTargetValue[]> | undefined;

    targets = CostTargetFilterList;
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
        mdr: ['',
            { validators: [Validators.required, Validators.min(0), Validators.max(1000)], updateOn: 'change' }],
        transactionCost: ['',
            { validators: [Validators.required, Validators.min(0), Validators.max(100)], updateOn: 'change' }],
        rollingReserves: ['',
            { validators: [Validators.required, Validators.min(0), Validators.max(10000)], updateOn: 'change' }],
        rollingReservesDays: ['',
            { validators: [Validators.required, Validators.min(0), Validators.max(365)], updateOn: 'change' }],
        chargebackCost: ['',
            { validators: [Validators.required, Validators.min(0), Validators.max(100)], updateOn: 'change' }],
        monthlyCost: ['',
            { validators: [Validators.required, Validators.min(0), Validators.max(100)], updateOn: 'change' }],
        minMonthlyCost: ['',
            { validators: [Validators.required, Validators.min(0), Validators.max(100)], updateOn: 'change' }]
    });

    get defaultSchemeFlag(): string {
        return this.defaultSchemeName;
    }

    get targetValueParams(): TargetParams {
        const val = this.schemeForm.get('target')?.value;
        let params = new TargetParams();
        switch (val) {
            case CostSettingsFilterType.Psp: {
                params.title = 'List of PSP';
                params.inputPlaceholder = 'New PSP...';
                params.dataList = PspFilterList;
                break;
            }
            case CostSettingsFilterType.Country: {
                params.title = 'List of countries';
                params.inputPlaceholder = 'New country...';
                params.dataList = CountryFilterList;
                break;
            }
        }
        return params;
    }

    constructor(private formBuilder: FormBuilder) { }

    ngOnInit(): void {
        this.schemeForm.valueChanges.subscribe({
            next: (result: any) => {
                if (!this.create && !this.loadingData) {
                    this.formChanged.emit(true);
                }
            }
        });
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

    setFormData(scheme: CostScheme | null): void {
        this.schemeForm.reset();
        this.defaultSchemeName = '';
        if (scheme !== null) {
            this.loadingData = true;
            this.defaultSchemeName = scheme.isDefault ? scheme.name : '';
            this.schemeForm.get('id')?.setValue(scheme?.id);
            this.schemeForm.get('name')?.setValue(scheme?.name);
            this.schemeForm.get('description')?.setValue(scheme?.description);
            this.schemeForm.get('isDefault')?.setValue(scheme?.isDefault);
            this.schemeForm.get('target')?.setValue(scheme?.target);
            this.schemeForm.get('instrument')?.setValue(scheme.instrument);
            this.schemeForm.get('trxType')?.setValue(scheme?.trxType);
            this.schemeForm.get('provider')?.setValue(scheme?.provider);
            this.schemeForm.get('mdr')?.setValue(scheme?.terms.mdr);
            this.schemeForm.get('transactionCost')?.setValue(scheme?.terms.transactionCost);
            this.schemeForm.get('rollingReserves')?.setValue(scheme?.terms.rollingReserves);
            this.schemeForm.get('rollingReservesDays')?.setValue(scheme?.terms.rollingReservesDays);
            this.schemeForm.get('chargebackCost')?.setValue(scheme?.terms.chargebackCost);
            this.schemeForm.get('monthlyCost')?.setValue(scheme?.terms.monthlyCost);
            this.schemeForm.get('minMonthlyCost')?.setValue(scheme?.terms.minMonthlyCost);
            scheme?.targetValues.forEach(x => this.targetValues.push(x));
            this.loadingData = false;
            this.formChanged.emit(false);
        } else {
            this.schemeForm.get('id')?.setValue('');
            this.schemeForm.get('name')?.setValue('');
            this.schemeForm.get('description')?.setValue('');
            this.schemeForm.get('isDefault')?.setValue('');
            this.schemeForm.get('target')?.setValue('');
            this.schemeForm.get('instrument')?.setValue('');
            this.schemeForm.get('trxType')?.setValue('');
            this.schemeForm.get('provider')?.setValue('');
            this.schemeForm.get('mdr')?.setValue('');
            this.schemeForm.get('transactionCost')?.setValue('');
            this.schemeForm.get('rollingReserves')?.setValue('');
            this.schemeForm.get('rollingReservesDays')?.setValue('');
            this.schemeForm.get('chargebackCost')?.setValue('');
            this.schemeForm.get('monthlyCost')?.setValue('');
            this.schemeForm.get('minMonthlyCost')?.setValue('');
            this.targetValues = [];
        }
    }

    setSchemeData(): CostScheme {
        let data = new CostScheme(null);
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
        data.terms.mdr = this.schemeForm.get('mdr')?.value;
        data.terms.transactionCost = this.schemeForm.get('transactionCost')?.value;
        data.terms.rollingReserves = this.schemeForm.get('rollingReserves')?.value;
        data.terms.rollingReservesDays = this.schemeForm.get('rollingReservesDays')?.value;
        data.terms.chargebackCost = this.schemeForm.get('chargebackCost')?.value;
        data.terms.monthlyCost = this.schemeForm.get('monthlyCost')?.value;
        data.terms.minMonthlyCost = this.schemeForm.get('minMonthlyCost')?.value;
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
            valid = this.validateField('transactionCost');
            if (valid) valid = this.validateField('mdr');
            if (valid) valid = this.validateField('rollingReserves');
            if (valid) valid = this.validateField('rollingReservesDays');
            if (valid) valid = this.validateField('chargebackCost');
            if (valid) valid = this.validateField('monthlyCost');
            if (valid) valid = this.validateField('minMonthlyCost');
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
