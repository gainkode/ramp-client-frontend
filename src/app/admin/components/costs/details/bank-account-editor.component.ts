import { Component, Input, OnInit, Output, EventEmitter } from '@angular/core';
import { Validators, FormBuilder } from '@angular/forms';
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
  @Output() save = new EventEmitter<WireTransferBankAccountItem>();
  @Output() delete = new EventEmitter<string>();
  @Output() cancel = new EventEmitter();

  private settingsId = '';
  public errorMessage = '';

  accountForm = this.formBuilder.group({
    name: ['', { validators: [Validators.required], updateOn: 'change' }],
    description: [''],
    auSelected: [false],
    ukSelected: [false],
    euSelected: [false]
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
      this.accountForm.get('ukSelected')?.setValue(account.ukAvailable);
      this.accountForm.get('euSelected')?.setValue(account.euAvailable);
    } else {
      this.accountForm.get('name')?.setValue('');
      this.accountForm.get('description')?.setValue('');
      this.accountForm.get('auSelected')?.setValue(false);
      this.accountForm.get('ukSelected')?.setValue(false);
      this.accountForm.get('euSelected')?.setValue(false);
    }
  }

  setSchemeData(): WireTransferBankAccountItem {
    const data = new WireTransferBankAccountItem(undefined);
    // common
    data.name = this.accountForm.get('name')?.value;
    data.description = this.accountForm.get('description')?.value;
    data.id = this.settingsId;
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
