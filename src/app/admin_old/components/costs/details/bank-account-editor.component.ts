import { Component, Input, OnInit, Output, EventEmitter } from '@angular/core';
import { Validators, FormBuilder } from '@angular/forms';
import { WireTransferBankAccount } from 'src/app/model/generated-models';
import { WireTransferPaymentCategory } from 'src/app/model/payment-base.model';
import { WireTransferPaymentCategoryList } from 'src/app/model/payment.model';
import { WireTransferBankAccountAu, WireTransferBankAccountEu, WireTransferBankAccountItem, WireTransferBankAccountUk } from '../../../../model/cost-scheme.model';

@Component({
  selector: 'app-bank-account-editor',
  templateUrl: 'bank-account-editor.component.html',
  styleUrls: ['bank-account-editor.component.scss']
})
export class BankAccountEditorComponent implements OnInit {
  @Input() permission = 0;
  @Input()
  set currentAccount(account: WireTransferBankAccountItem | null) {
    this.setFormData(account);
    this.settingsId = (account !== null) ? account?.id : '';
  }
  @Input() create = false;
  @Output() save = new EventEmitter<WireTransferBankAccount>();
  @Output() delete = new EventEmitter<string>();
  @Output() cancel = new EventEmitter();

  private settingsId = '';
  private bankCategories = WireTransferPaymentCategoryList;
  public errorMessage = '';
  public auCategory: any;
  public ukCategory: any;
  public euCategory: any;

  accountForm = this.formBuilder.group({
    name: ['', { validators: [Validators.required], updateOn: 'change' }],
    description: [''],
    auSelected: [false],
    ukSelected: [false],
    euSelected: [false],
    auAccountName: [undefined],
    auAccountNumber: [undefined],
    auBsb: [undefined],
    ukAccountName: [undefined],
    ukAccountNumber: [undefined],
    ukSortCode: [undefined],
    euBankAddress: [undefined],
    euBankName: [undefined],
    euBeneficiaryAddress: [undefined],
    euBeneficiaryName: [undefined],
    euIban: [undefined],
    euSwiftBic: [undefined]
  });

  constructor(
    private formBuilder: FormBuilder) {
  }

  ngOnInit(): void {
    this.auCategory = this.bankCategories.find(x => x.id === WireTransferPaymentCategory.AU);
    this.ukCategory = this.bankCategories.find(x => x.id === WireTransferPaymentCategory.UK);
    this.euCategory = this.bankCategories.find(x => x.id === WireTransferPaymentCategory.EU);
  }

  setFormData(account: WireTransferBankAccountItem | null): void {
    this.accountForm.reset();
    if (account !== null) {
      this.accountForm.get('name')?.setValue(account.name);
      this.accountForm.get('description')?.setValue(account.description);
      if (account.auAvailable) {
        this.accountForm.get('auSelected')?.setValue(true);
        this.accountForm.get('auAccountName')?.setValue(account.au?.accountName);
        this.accountForm.get('auAccountNumber')?.setValue(account.au?.accountNumber);
        this.accountForm.get('auBsb')?.setValue(account.au?.bsb);
      }
      if (account.ukAvailable) {
        this.accountForm.get('ukSelected')?.setValue(true);
        this.accountForm.get('ukAccountName')?.setValue(account.uk?.accountName);
        this.accountForm.get('ukAccountNumber')?.setValue(account.uk?.accountNumber);
        this.accountForm.get('ukSortCode')?.setValue(account.uk?.sortCode);
      }
      if (account.euAvailable) {
        this.accountForm.get('euSelected')?.setValue(true);
        this.accountForm.get('euBankAddress')?.setValue(account.eu?.bankAddress);
        this.accountForm.get('euBankName')?.setValue(account.eu?.bankName);
        this.accountForm.get('euBeneficiaryAddress')?.setValue(account.eu?.beneficiaryAddress);
        this.accountForm.get('euBeneficiaryName')?.setValue(account.eu?.beneficiaryName);
        this.accountForm.get('euIban')?.setValue(account.eu?.iban);
        this.accountForm.get('euSwiftBic')?.setValue(account.eu?.swiftBic);
      }
    } else {
      this.accountForm.get('name')?.setValue('');
      this.accountForm.get('description')?.setValue('');
      this.accountForm.get('auSelected')?.setValue(true);
      this.accountForm.get('ukSelected')?.setValue(true);
      this.accountForm.get('euSelected')?.setValue(true);
      this.accountForm.get('auAccountName')?.setValue(undefined);
      this.accountForm.get('auAccountNumber')?.setValue(undefined);
      this.accountForm.get('auBsb')?.setValue(undefined);
      this.accountForm.get('ukAccountName')?.setValue(undefined);
      this.accountForm.get('ukAccountNumber')?.setValue(undefined);
      this.accountForm.get('ukSortCode')?.setValue(undefined);
      this.accountForm.get('euBankAddress')?.setValue(undefined);
      this.accountForm.get('euBankName')?.setValue(undefined);
      this.accountForm.get('euBeneficiaryAddress')?.setValue(undefined);
      this.accountForm.get('euBeneficiaryName')?.setValue(undefined);
      this.accountForm.get('euIban')?.setValue(undefined);
      this.accountForm.get('euSwiftBic')?.setValue(undefined);
    }
  }

  setSchemeData(): WireTransferBankAccount {
    const data = {} as WireTransferBankAccount;
    // common
    data.name = this.accountForm.get('name')?.value;
    data.description = this.accountForm.get('description')?.value;
    data.bankAccountId = this.settingsId;
    // data
    if (this.accountForm.get('auSelected')?.value === true) {
      const auAccountName = this.accountForm.get('auAccountName')?.value;
      const auAccountNumber = this.accountForm.get('auAccountNumber')?.value;
      const auBsb = this.accountForm.get('auBsb')?.value;
      const auData: WireTransferBankAccountAu = {
        accountName: auAccountName,
        accountNumber: auAccountNumber,
        bsb: auBsb
      };
      data.au = JSON.stringify(auData);
    } else {
      data.au = null;
    }
    if (this.accountForm.get('ukSelected')?.value === true) {
      const ukAccountName = this.accountForm.get('ukAccountName')?.value;
      const ukAccountNumber = this.accountForm.get('ukAccountNumber')?.value;
      const ukSortCode = this.accountForm.get('ukSortCode')?.value;
      const ukData: WireTransferBankAccountUk = {
        accountName: ukAccountName,
        accountNumber: ukAccountNumber,
        sortCode: ukSortCode
      };
      data.uk = JSON.stringify(ukData);
    } else {
      data.uk = null;
    }
    if (this.accountForm.get('euSelected')?.value === true) {
      const euBankAddress = this.accountForm.get('euBankAddress')?.value;
      const euBankName = this.accountForm.get('euBankName')?.value;
      const euBeneficiaryAddress = this.accountForm.get('euBeneficiaryAddress')?.value;
      const euBeneficiaryName = this.accountForm.get('euBeneficiaryName')?.value;
      const euIban = this.accountForm.get('euIban')?.value;
      const euSwiftBic = this.accountForm.get('euSwiftBic')?.value;
      const euData: WireTransferBankAccountEu = {
        bankAddress: euBankAddress,
        bankName: euBankName,
        beneficiaryAddress: euBeneficiaryAddress,
        beneficiaryName: euBeneficiaryName,
        iban: euIban,
        swiftBic: euSwiftBic
      };
      data.eu = JSON.stringify(euData);
    } else {
      data.eu = null;
    }
    return data;
  }

  onDeleteScheme(): void {
    this.delete.emit(this.settingsId);
  }

  onSubmit(): void {
    if (this.accountForm.valid) {
      this.save.emit(this.setSchemeData());
    } else {
      this.errorMessage = 'Input data is not completely valid. Please, check all fields are valid.';
    }
  }

  onCancel(): void {
    this.cancel.emit();
  }
}
