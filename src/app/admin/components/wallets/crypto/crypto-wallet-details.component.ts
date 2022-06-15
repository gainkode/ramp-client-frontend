import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { WalletItem } from 'src/app/admin/model/wallet.model';
import { AdminDataService } from 'src/app/services/admin-data.service';
import { AssetAddress } from 'src/app/model/generated-models';
import { AuthService } from 'src/app/services/auth.service';

@Component({
  selector: 'app-admin-crypto-wallet-details',
  templateUrl: 'crypto-wallet-details.component.html',
  styleUrls: ['crypto-wallet-details.component.scss', '../../../assets/scss/_validation.scss']
})
export class AdminCryptoWalletDetailsComponent implements OnInit, OnDestroy {
  @Input() permission = 0;
  @Input() set wallet(val: WalletItem | undefined) {
    this.setFormData(val);
  }
  @Output() save = new EventEmitter();
  @Output() close = new EventEmitter();

  private subscriptions: Subscription = new Subscription();

  submitted = false;
  settingsId = '';
  userId = '';
  walletData: WalletItem | undefined = undefined;
  errorMessage = '';
  inProgress = false;

  form = this.formBuilder.group({
    vaultName: ['', { validators: [Validators.required], updateOn: 'change' }]
  });

  constructor(
    private formBuilder: FormBuilder,
    private router: Router,
    private auth: AuthService,
    private adminService: AdminDataService) { }

  ngOnInit(): void {

  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  setFormData(data: WalletItem | undefined): void {
    this.errorMessage = '';
    this.form.reset();
    if (data) {
      this.walletData = data;
      this.form.get('vaultName')?.setValue(data?.vaultName);
      this.userId = data.userId ?? '';
      this.settingsId = data.vaultId ?? '';
    } else {
      this.walletData = undefined;
      this.form.get('vaultName')?.setValue('');
      this.userId = '';
      this.settingsId = '';
    }
  }

  private setWalletData(): AssetAddress {
    const data = {
      userId: this.userId,
      vaultId: this.settingsId,
      vaultName: this.form.get('vaultName')?.value
    } as AssetAddress;
    return data;
  }

  onSubmit(): void {
    this.submitted = true;
    if (this.form.valid) {
      const address = this.setWalletData();
      this.inProgress = true;
      const requestData = this.adminService.updateUserVault(address);
      if (requestData) {
        this.subscriptions.add(
          requestData.subscribe(({ data }) => {
            this.inProgress = false;
            this.save.emit();
          }, (error) => {
            this.inProgress = false;
            this.errorMessage = error;
            if (this.auth.token === '') {
              this.router.navigateByUrl('/');
            }
          })
        );
      }
    }
  }

  onClose(): void {
    this.close.emit();
  }
}
