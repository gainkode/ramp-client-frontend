import { Component, EventEmitter, Input, Output, OnInit } from '@angular/core';
import { UntypedFormBuilder, Validators } from '@angular/forms';
import { WireTransferBankAccountAu, WireTransferBankAccountEu, WireTransferBankAccountUk } from 'model/cost-scheme.model';
import { BankCategory, PaymentInstrument, TransactionSource, WireTransferPaymentCategory } from 'model/generated-models';
import { WidgetSettings, WireTransferPaymentCategoryItem } from 'model/payment-base.model';
import { CheckoutSummary } from 'model/payment.model';
import { PaymentDataService } from 'services/payment.service';
import { take } from 'rxjs/operators';
import { ErrorService } from 'services/error.service';
@Component({
	selector: 'app-widget-sell-details',
	templateUrl: 'sell-details.component.html',
	styleUrls: ['../../../../../assets/text-control.scss']
})
export class WidgetSellDetailsComponent implements OnInit{
    @Input() summary: CheckoutSummary | undefined = undefined;
		@Input() widget: WidgetSettings | undefined = undefined;
		@Output() handleError = new EventEmitter<string>();
    @Output() onBack = new EventEmitter();
    @Output() onComplete = new EventEmitter<string>();

    done = false;
    bankCategories: WireTransferPaymentCategoryItem[] = [];
    selectedCategory: WireTransferPaymentCategory | undefined = undefined;
    PAYMENT_CATEGORY: typeof WireTransferPaymentCategory = WireTransferPaymentCategory;
    formErrorMessages: { [key: string]: string; } = {
    	['required']: 'Field is required'
    };

    auDataForm = this.formBuilder.group({
    	accountName: [undefined, { validators: [Validators.required], updateOn: 'change' }],
    	accountNumber: [undefined, { validators: [Validators.required], updateOn: 'change' }],
    	bsb: [undefined, { validators: [Validators.required], updateOn: 'change' }]
    });
    euDataForm = this.formBuilder.group({
    	bankAddress: [undefined, { validators: [Validators.required], updateOn: 'change' }],
    	bankName: [undefined, { validators: [Validators.required], updateOn: 'change' }],
    	beneficiaryAddress: [undefined, { validators: [Validators.required], updateOn: 'change' }],
    	beneficiaryName: [undefined, { validators: [Validators.required], updateOn: 'change' }],
    	iban: [undefined, { validators: [Validators.required], updateOn: 'change' }],
    	swiftBic: [undefined, { validators: [Validators.required], updateOn: 'change' }]
    });
    ukDataForm = this.formBuilder.group({
    	accountName: [undefined, { validators: [Validators.required], updateOn: 'change' }],
    	accountNumber: [undefined, { validators: [Validators.required], updateOn: 'change' }],
    	sortCode: [undefined, { validators: [Validators.required], updateOn: 'change' }]
    });

    get currentFormValid(): boolean {
    	let valid = false;
    	if (this.selectedCategory === WireTransferPaymentCategory.Au) {
    		valid = this.auDataForm.valid;
    	} else if (this.selectedCategory === WireTransferPaymentCategory.Eu) {
    		valid = this.euDataForm.valid;
    	} else if (this.selectedCategory === WireTransferPaymentCategory.Uk) {
    		valid = this.ukDataForm.valid;
    	}
    	return valid;
    }

    constructor(
    	private formBuilder: UntypedFormBuilder,
    	private paymentService: PaymentDataService,
    	private errorHandler: ErrorService,
    ) {
    	this.setFormData();
    }

    ngOnInit(): void {
    	this.getBankCategoriesSettings();
    }

    getBankCategoriesSettings(): void {
    	const settingsData$ = this.paymentService.myBankCategories(
    		this.summary.transactionType,
    		this.getSource(this.widget),
    		PaymentInstrument.WireTransfer
    	).valueChanges.pipe(take(1));
    	settingsData$.subscribe(({ data }) => {
    		const settingsResult = data.myBankCategories as BankCategory[];
				
    		if (!settingsResult.length) {
    			this.handleError.emit(this.errorHandler.getError('bank_categories_not_found', 'Bank categories not found'));
    			return;
    		}

    		this.bankCategories = settingsResult.map(item => {
    			let data: WireTransferBankAccountAu | WireTransferBankAccountEu | WireTransferBankAccountUk;
					
    			// eslint-disable-next-line @typescript-eslint/indent
					switch (item.id) {
    				case WireTransferPaymentCategory.Au: 
    					data = new WireTransferBankAccountAu();
    					break;
    				case WireTransferPaymentCategory.Eu:
    					data = new WireTransferBankAccountEu();
    					break;
    				case WireTransferPaymentCategory.Uk:
    					data = new WireTransferBankAccountUk();
    					break;
    			}
    			return <WireTransferPaymentCategoryItem>{
    				id: item.id,
    				title: item.title,
    				data: JSON.stringify(data)
    			};
    		});

    	}, (error) => {
    		this.handleError.emit(this.errorHandler.getError(error.message, 'Something went wrong'));
    	});
    }
		
    private setFormData(): void {
    	const auCategory = this.bankCategories.find(x => x.id === WireTransferPaymentCategory.Au);
    	if (auCategory) {
    		const auData = JSON.parse(auCategory.data);
    		if (auData) {
    			this.auDataForm.get('accountName')?.setValue(auData.accountName);
    			this.auDataForm.get('accountNumber')?.setValue(auData.accountNumber);
    			this.auDataForm.get('bsb')?.setValue(auData.bsb);
    		}
    	}
    	const euCategory = this.bankCategories.find(x => x.id === WireTransferPaymentCategory.Eu);
    	if (euCategory) {
    		const euData = JSON.parse(euCategory.data);
    		if (euData) {
    			this.euDataForm.get('bankAddress')?.setValue(euData.bankAddress);
    			this.euDataForm.get('bankName')?.setValue(euData.bankName);
    			this.euDataForm.get('beneficiaryAddress')?.setValue(euData.beneficiaryAddress);
    			this.euDataForm.get('beneficiaryName')?.setValue(euData.beneficiaryName);
    			this.euDataForm.get('iban')?.setValue(euData.iban);
    			this.euDataForm.get('swiftBic')?.setValue(euData.swiftBic);
    		}
    	}
    	const ukCategory = this.bankCategories.find(x => x.id === WireTransferPaymentCategory.Uk);
    	if (ukCategory) {
    		const ukData = JSON.parse(ukCategory.data);
    		if (ukData) {
    			this.ukDataForm.get('accountName')?.setValue(ukData.accountName);
    			this.ukDataForm.get('accountNumber')?.setValue(ukData.accountNumber);
    			this.ukDataForm.get('sortCode')?.setValue(ukData.sortCode);
    		}
    	}
    }

    onSubmit(): void {
    	let paymentData = '';
    	if (this.selectedCategory === WireTransferPaymentCategory.Au && this.auDataForm.valid) {
    		const data: WireTransferBankAccountAu = {
    			accountName: this.auDataForm.get('accountName')?.value,
    			accountNumber: this.auDataForm.get('accountNumber')?.value,
    			bsb: this.auDataForm.get('bsb')?.value
    		};
    		paymentData = JSON.stringify(data);
    	} else if (this.selectedCategory === WireTransferPaymentCategory.Eu && this.euDataForm.valid) {
    		const data: WireTransferBankAccountEu = {
    			bankAddress: this.euDataForm.get('bankAddress')?.value,
    			bankName: this.euDataForm.get('bankName')?.value,
    			beneficiaryAddress: this.euDataForm.get('beneficiaryAddress')?.value,
    			beneficiaryName: this.euDataForm.get('beneficiaryName')?.value,
    			iban: this.euDataForm.get('iban')?.value,
    			swiftBic: this.euDataForm.get('swiftBic')?.value
    		};
    		paymentData = JSON.stringify(data);
    	} else if (this.selectedCategory === WireTransferPaymentCategory.Uk && this.ukDataForm.valid) {
    		const data: WireTransferBankAccountUk = {
    			accountName: this.ukDataForm.get('accountName')?.value,
    			accountNumber: this.ukDataForm.get('accountNumber')?.value,
    			sortCode: this.ukDataForm.get('sortCode')?.value
    		};
    		paymentData = JSON.stringify(data);
    	}
    	if (paymentData !== '') {
    		const result = {
    			id: this.selectedCategory,
    			title: this.bankCategories.find(x => x.id === this.selectedCategory)?.title,
    			data: paymentData
    		} as WireTransferPaymentCategoryItem;
    		this.done = true;
    		this.onComplete.emit(JSON.stringify(result));
    	}
    }
		
    private getSource(widget: WidgetSettings): TransactionSource {
    	let source = TransactionSource.Wallet;
    	if (widget.embedded === false) {
    		source = widget.widgetId === '' ? TransactionSource.QuickCheckout : TransactionSource.Widget;
    	}
    	return source;
    }
}
