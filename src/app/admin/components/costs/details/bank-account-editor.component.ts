import { Component, Input, OnInit, Output, EventEmitter } from '@angular/core';
import { Validators, FormBuilder } from '@angular/forms';
import { WireTransferBankAccount } from 'src/app/model/generated-models';
import { WireTransferBankAccountItem } from '../../../../model/cost-scheme.model';

@Component({
  selector: 'app-bank-account-editor',
  templateUrl: 'bank-account-editor.component.html',
  styleUrls: ['bank-account-editor.component.scss']
})
export class BankAccountEditorComponent implements OnInit {
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
  public errorMessage = '';

  accountForm = this.formBuilder.group({
    name: ['', { validators: [Validators.required], updateOn: 'change' }],
    description: [''],
    auSelected: [false],
    auAccountName: [undefined],
    auAccountNumber: [undefined],
    auBsb: [undefined],
    ukSelected: [false],
    ukAccountName: [undefined],
    ukAccountNumber: [undefined],
    ukSortCode: [undefined],
    euSelected: [false],
    euAccountOwnerName: [undefined],
    euSwift: [undefined],
    euIban: [undefined],
  });

  constructor(
    private formBuilder: FormBuilder) {
  }

  ngOnInit(): void {
    // this.accountForm.valueChanges.subscribe({
    //   next: (result: any) => {
    //     if (!this.create && !this.loadingData) {
    //       this.formChanged.emit(true);
    //     }
    //   }
    // });
  }

  setFormData(account: WireTransferBankAccountItem | null): void {
    this.accountForm.reset();
    if (account !== null) {
      this.accountForm.get('name')?.setValue(account.name);
      this.accountForm.get('description')?.setValue(account.description);
      this.accountForm.get('auSelected')?.setValue(account.auAvailable);
      if (account.auAvailable) {
        this.accountForm.get('auAccountName')?.setValue(account.au?.accountName);
        this.accountForm.get('auAccountNumber')?.setValue(account.au?.accountNumber);
        this.accountForm.get('auBsb')?.setValue(account.au?.bsb);
      }
      this.accountForm.get('ukSelected')?.setValue(account.ukAvailable);
      if (account.ukAvailable) {
        this.accountForm.get('ukAccountName')?.setValue(account.uk?.accountName);
        this.accountForm.get('ukAccountNumber')?.setValue(account.uk?.accountNumber);
        this.accountForm.get('ukSortCode')?.setValue(account.uk?.sortCode);
      }
      this.accountForm.get('euSelected')?.setValue(account.euAvailable);
      if (account.euAvailable) {
        this.accountForm.get('euAccountOwnerName')?.setValue(account.eu?.accountOwnerName);
        this.accountForm.get('euSwift')?.setValue(account.eu?.swift);
        this.accountForm.get('euIban')?.setValue(account.eu?.iban);
      }
    } else {
      this.accountForm.get('name')?.setValue('');
      this.accountForm.get('description')?.setValue('');
      this.accountForm.get('auSelected')?.setValue(false);
      this.accountForm.get('auAccountName')?.setValue(undefined);
      this.accountForm.get('auAccountNumber')?.setValue(undefined);
      this.accountForm.get('auBsb')?.setValue(undefined);
      this.accountForm.get('ukSelected')?.setValue(false);
      this.accountForm.get('ukAccountName')?.setValue(undefined);
      this.accountForm.get('ukAccountNumber')?.setValue(undefined);
      this.accountForm.get('ukSortCode')?.setValue(undefined);
      this.accountForm.get('euSelected')?.setValue(false);
      this.accountForm.get('euAccountOwnerName')?.setValue(undefined);
      this.accountForm.get('euSwift')?.setValue(undefined);
      this.accountForm.get('euIban')?.setValue(undefined);
    }
  }

  setSchemeData(): WireTransferBankAccount {
    const data = {} as WireTransferBankAccount;
    // common
    data.name = this.accountForm.get('name')?.value;
    data.description = this.accountForm.get('description')?.value;
    data.bankAccountId = this.settingsId;
    // data
    const auSelected = this.accountForm.get('auSelected')?.value ?? false;
    if (auSelected === true) {
      const auAccountName = this.accountForm.get('auAccountName')?.value;
      const auAccountNumber = this.accountForm.get('auAccountNumber')?.value;
      const auBsb = this.accountForm.get('auBsb')?.value;
      if (auAccountName || auAccountNumber || auBsb) {
        const auData = {
          accountName: auAccountName,
          accountNumber: auAccountNumber,
          bsb: auBsb
        };
        data.au = JSON.stringify(auData);
      }
    }
    const ukSelected = this.accountForm.get('ukSelected')?.value ?? false;
    if (ukSelected === true) {
      const ukAccountName = this.accountForm.get('ukAccountName')?.value;
      const ukAccountNumber = this.accountForm.get('ukAccountNumber')?.value;
      const ukSortCode = this.accountForm.get('ukSortCode')?.value;
      if (ukAccountName || ukAccountNumber || ukSortCode) {
        const ukData = {
          accountName: ukAccountName,
          accountNumber: ukAccountNumber,
          sortCode: ukSortCode
        };
        data.uk = JSON.stringify(ukData);
      }
    }
    const euSelected = this.accountForm.get('euSelected')?.value ?? false;
    if (euSelected === true) {
      const euAccountOwnerName = this.accountForm.get('euAccountOwnerName')?.value;
      const euSwift = this.accountForm.get('euSwift')?.value;
      const euIban = this.accountForm.get('euIban')?.value;
      if (euAccountOwnerName || euSwift || euIban) {
        const euData = {
          accountOwnerName: euAccountOwnerName,
          swift: euSwift,
          iban: euIban
        };
        data.eu = JSON.stringify(euData);
      }
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
