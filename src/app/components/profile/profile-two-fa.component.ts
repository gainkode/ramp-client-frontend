import { Component, Input, OnInit } from '@angular/core';
import { MatSlideToggleChange } from '@angular/material/slide-toggle';
import { QrCodeData } from 'src/app/model/common.model';
import { TwoFactorAuthenticationResult } from 'src/app/model/generated-models';
import { AuthService } from 'src/app/services/auth.service';
import { ErrorService } from 'src/app/services/error.service';

@Component({
  selector: 'app-two-fa',
  templateUrl: './profile-two-fa.component.html'
})
export class ProfileTwoFAComponent implements OnInit {
  @Input() enabled = false;
  inProgress = false;
  errorMessage = '';
  twoFaEnabled = false;
  qrCode: QrCodeData = new QrCodeData();

  constructor(private auth: AuthService, private errorHandler: ErrorService) {

  }

  ngOnInit(): void {
    this.twoFaEnabled = this.enabled;
  }

  enabledChange(event: MatSlideToggleChange): void {
    this.twoFaEnabled = event.checked;
    if (event.checked) {
      this.enable2Fa();
    } else {
      this.disable2Fa();
    }
  }

  private enable2Fa(): void {
    this.errorMessage = '';
    this.inProgress = true;
    this.auth.generate2FaCode().subscribe(({ data }) => {
      this.inProgress = false;
      const resultData = data.generate2faCode as TwoFactorAuthenticationResult;
      this.qrCode.code = resultData.qr;
      this.qrCode.symbols = resultData.code;
      this.qrCode.url = resultData.otpauthUrl;
    },
      (error) => {
        this.inProgress = false;
        this.errorMessage = this.errorHandler.getError(
          error.message,
          'Unable to generate a code'
        );
      }
    );
  }

  private disable2Fa(): void {
    console.log('disabled');
  }
}