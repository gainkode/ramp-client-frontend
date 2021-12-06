import { Component, ViewChild, OnInit, OnDestroy, ElementRef } from '@angular/core';
import { AdminDataService } from '../../services/admin-data.service';
import { Subscription } from 'rxjs';
import { FormBuilder, Validators } from '@angular/forms';
import { CustodyProviderList, KycProviderList } from 'src/app/model/payment.model';
import { LiquidityProviderList } from '../../model/lists.model';
import { SettingsCommon } from 'src/app/model/generated-models';
import { MatChipInputEvent } from '@angular/material/chips';
import { MatDialog } from '@angular/material/dialog';
import { CommonDialogBox } from 'src/app/components/dialogs/common-box.dialog';

@Component({
  templateUrl: 'common-settings.component.html',
  styleUrls: ['common-settings.component.scss']
})
export class CommonSettingsEditorComponent implements OnInit, OnDestroy {
  @ViewChild('emailSearchInput') emailSearchInput!: ElementRef<HTMLInputElement>;

  kycProviderOptions = KycProviderList;
  custodyProviderOptions = CustodyProviderList;
  liquidityProviderOptions = LiquidityProviderList;

  form = this.formBuilder.group({
    id: [null],
    liquidityProvider: [undefined, { validators: [Validators.required], updateOn: 'change' }],
    custodyProvider: [undefined, { validators: [Validators.required], updateOn: 'change' }],
    kycProvider: [undefined, { validators: [Validators.required], updateOn: 'change' }],
    adminEmails: [[]],
    stoppedForServicing: [false, { validators: [Validators.required], updateOn: 'change' }]
  });

  private subscriptions: Subscription = new Subscription();

  constructor(
    private formBuilder: FormBuilder,
    public dialog: MatDialog,
    private adminService: AdminDataService) {
  }

  ngOnInit(): void {
    this.loadData();
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  private loadData(): void {
    this.subscriptions.add(
      this.adminService.getSettingsCommon()?.valueChanges.subscribe(settings => {
        const settingsCommon: SettingsCommon = settings.data.getSettingsCommon;
        const additionalSettings = (settingsCommon.additionalSettings) ? JSON.parse(settingsCommon.additionalSettings) : undefined;
        this.form.get('id')?.setValue(settingsCommon.settingsCommonId);
        this.form.get('liquidityProvider')?.setValue(settingsCommon.liquidityProvider);
        this.form.get('custodyProvider')?.setValue(settingsCommon.custodyProvider);
        this.form.get('kycProvider')?.setValue(settingsCommon.kycProvider);
        this.form.get('adminEmails')?.setValue(settingsCommon.adminEmails);
        this.form.get('stoppedForServicing')?.setValue(settingsCommon.stoppedForServicing);
        console.log(additionalSettings);
      }, (error) => {

      })
    );
  }

  handleEmailOptionAdded(event: MatChipInputEvent): void {
    if (event.value) {
      this.form.controls.adminEmails.setValue([...this.form.controls.adminEmails.value, event.value]);
      event.input.value = '';
    }
  }

  removeAdminEmailOption(email: string): void {
    this.form.controls.adminEmails?.setValue(
      this.form.controls.adminEmails?.value.filter(v => v !== email)
    );
  }

  private showSuccessDialog(): void {
    const dialogRef = this.dialog.open(CommonDialogBox, {
      width: '350px',
      data: {
        title: '',
        message: 'Common settings have been saved successfully'
      }
    });
  }

  private getDataObject(): SettingsCommon {
    let emailList = this.form.get('adminEmails')?.value as string[];
    if (emailList.length === 0) {
      const val = this.emailSearchInput.nativeElement.value as string;
      if (val && val !== '') {
        this.handleEmailOptionAdded({
          input: this.emailSearchInput.nativeElement,
          value: val
        });
        emailList = this.form.get('adminEmails')?.value as string[];
      }
    }
    return {
      settingsCommonId: this.form.get('id')?.value,
      liquidityProvider: this.form.get('liquidityProvider')?.value,
      custodyProvider: this.form.get('custodyProvider')?.value,
      kycProvider: this.form.get('kycProvider')?.value,
      adminEmails: emailList,
      stoppedForServicing: this.form.get('stoppedForServicing')?.value
    } as SettingsCommon;
  }

  onSubmit(): void {
    const data = this.getDataObject();
    console.log(data);
    this.showSuccessDialog();
  }
}
