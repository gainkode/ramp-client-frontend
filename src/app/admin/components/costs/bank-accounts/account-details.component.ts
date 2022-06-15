import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { Subscription } from 'rxjs';
import { AdminDataService } from 'src/app/services/admin-data.service';
import { WireTransferBankAccountAu, WireTransferBankAccountEu, WireTransferBankAccountItem, WireTransferBankAccountUk } from 'src/app/model/cost-scheme.model';
import { WireTransferBankAccount } from 'src/app/model/generated-models';
import { WireTransferPaymentCategory } from 'src/app/model/payment-base.model';
import { WireTransferPaymentCategoryList } from 'src/app/model/payment.model';
import { AuthService } from 'src/app/services/auth.service';

@Component({
  selector: 'app-admin-bank-account-details',
  templateUrl: 'account-details.component.html',
  styleUrls: ['account-details.component.scss', '../../../assets/scss/_validation.scss']
})
export class AdminBankAccountDetailsComponent implements OnInit, OnDestroy {
  @Input() permission = 0;
  @Input()
  set currentAccount(account: WireTransferBankAccountItem | undefined) {
    this.setFormData(account);
    this.settingsId = (account) ? account?.id : '';
    this.createNew = (this.settingsId === '');
  }

  @Output() save = new EventEmitter();
  @Output() close = new EventEmitter();

  private subscriptions: Subscription = new Subscription();
  private removeDialog: NgbModalRef | undefined = undefined;
  private settingsId = '';

  submitted = false;
  createNew = false;
  saveInProgress = false;
  deleteInProgress = false;
  public errorMessage = '';
  private bankCategories = WireTransferPaymentCategoryList;
  public auCategory: any;
  public ukCategory: any;
  public euCategory: any;

  form = this.formBuilder.group({
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
    private formBuilder: FormBuilder,
    private router: Router,
    private modalService: NgbModal,
    private auth: AuthService,
    private adminService: AdminDataService) {

  }

  ngOnInit(): void {
    this.auCategory = this.bankCategories.find(x => x.id === WireTransferPaymentCategory.AU);
    this.ukCategory = this.bankCategories.find(x => x.id === WireTransferPaymentCategory.UK);
    this.euCategory = this.bankCategories.find(x => x.id === WireTransferPaymentCategory.EU);
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  setFormData(account?: WireTransferBankAccountItem): void {
    if (account) {
      this.form.get('name')?.setValue(account.name);
      this.form.get('description')?.setValue(account.description);
      if (account.auAvailable) {
        this.form.get('auSelected')?.setValue(true);
        this.form.get('auAccountName')?.setValue(account.au?.accountName);
        this.form.get('auAccountNumber')?.setValue(account.au?.accountNumber);
        this.form.get('auBsb')?.setValue(account.au?.bsb);
      }
      if (account.ukAvailable) {
        this.form.get('ukSelected')?.setValue(true);
        this.form.get('ukAccountName')?.setValue(account.uk?.accountName);
        this.form.get('ukAccountNumber')?.setValue(account.uk?.accountNumber);
        this.form.get('ukSortCode')?.setValue(account.uk?.sortCode);
      }
      if (account.euAvailable) {
        this.form.get('euSelected')?.setValue(true);
        this.form.get('euBankAddress')?.setValue(account.eu?.bankAddress);
        this.form.get('euBankName')?.setValue(account.eu?.bankName);
        this.form.get('euBeneficiaryAddress')?.setValue(account.eu?.beneficiaryAddress);
        this.form.get('euBeneficiaryName')?.setValue(account.eu?.beneficiaryName);
        this.form.get('euIban')?.setValue(account.eu?.iban);
        this.form.get('euSwiftBic')?.setValue(account.eu?.swiftBic);
      }
    } else {
      this.form.get('name')?.setValue('');
      this.form.get('description')?.setValue('');
      this.form.get('auSelected')?.setValue(false);
      this.form.get('ukSelected')?.setValue(false);
      this.form.get('euSelected')?.setValue(false);
      this.form.get('auAccountName')?.setValue(undefined);
      this.form.get('auAccountNumber')?.setValue(undefined);
      this.form.get('auBsb')?.setValue(undefined);
      this.form.get('ukAccountName')?.setValue(undefined);
      this.form.get('ukAccountNumber')?.setValue(undefined);
      this.form.get('ukSortCode')?.setValue(undefined);
      this.form.get('euBankAddress')?.setValue(undefined);
      this.form.get('euBankName')?.setValue(undefined);
      this.form.get('euBeneficiaryAddress')?.setValue(undefined);
      this.form.get('euBeneficiaryName')?.setValue(undefined);
      this.form.get('euIban')?.setValue(undefined);
      this.form.get('euSwiftBic')?.setValue(undefined);
    }
  }

  setAccountData(): WireTransferBankAccount {
    const data = {} as WireTransferBankAccount;
    // common
    data.name = this.form.get('name')?.value;
    data.description = this.form.get('description')?.value;
    data.bankAccountId = this.settingsId;
    // data
    if (this.form.get('auSelected')?.value === true) {
      const auAccountName = this.form.get('auAccountName')?.value;
      const auAccountNumber = this.form.get('auAccountNumber')?.value;
      const auBsb = this.form.get('auBsb')?.value;
      const auData: WireTransferBankAccountAu = {
        accountName: auAccountName,
        accountNumber: auAccountNumber,
        bsb: auBsb
      };
      data.au = JSON.stringify(auData);
    } else {
      data.au = null;
    }
    if (this.form.get('ukSelected')?.value === true) {
      const ukAccountName = this.form.get('ukAccountName')?.value;
      const ukAccountNumber = this.form.get('ukAccountNumber')?.value;
      const ukSortCode = this.form.get('ukSortCode')?.value;
      const ukData: WireTransferBankAccountUk = {
        accountName: ukAccountName,
        accountNumber: ukAccountNumber,
        sortCode: ukSortCode
      };
      data.uk = JSON.stringify(ukData);
    } else {
      data.uk = null;
    }
    if (this.form.get('euSelected')?.value === true) {
      const euBankAddress = this.form.get('euBankAddress')?.value;
      const euBankName = this.form.get('euBankName')?.value;
      const euBeneficiaryAddress = this.form.get('euBeneficiaryAddress')?.value;
      const euBeneficiaryName = this.form.get('euBeneficiaryName')?.value;
      const euIban = this.form.get('euIban')?.value;
      const euSwiftBic = this.form.get('euSwiftBic')?.value;
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

  onSubmit(): void {
    this.submitted = true;
    if (this.form.valid) {
      this.saveAccount(this.setAccountData());
    }
  }

  deleteAccount(content: any): void {
    this.removeDialog = this.modalService.open(content, {
      backdrop: 'static',
      windowClass: 'modalCusSty',
    });
    this.subscriptions.add(
      this.removeDialog.closed.subscribe(val => {
        this.deleteAccountConfirmed(this.settingsId ?? '');
      })
    );
  }

  private saveAccount(account: WireTransferBankAccount): void {
    this.errorMessage = '';
    this.saveInProgress = true;
    const requestData$ = this.adminService.saveBankAccountSettings(account, this.createNew);
    this.subscriptions.add(
      requestData$.subscribe(({ data }) => {
        this.saveInProgress = false;
        this.save.emit();
      }, (error) => {
        this.saveInProgress = false;
        this.errorMessage = error;
        if (this.auth.token === '') {
          this.router.navigateByUrl('/');
        }
      })
    );
  }

  deleteAccountConfirmed(id: string): void {
    this.errorMessage = '';
    this.saveInProgress = true;
    const requestData$ = this.adminService.deleteBankAccountSettings(id);
    this.subscriptions.add(
      requestData$.subscribe(({ data }) => {
        this.saveInProgress = false;
        this.save.emit();
      }, (error) => {
        this.saveInProgress = false;
        this.errorMessage = error;
        if (this.auth.token === '') {
          this.router.navigateByUrl('/');
        }
      })
    );
  }
}
