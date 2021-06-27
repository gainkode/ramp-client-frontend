import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { SettingsCommon, SettingsKycShort } from 'src/app/model/generated-models';
import { KycLevelShort } from 'src/app/model/identification.model';
import { AuthService } from 'src/app/services/auth.service';
import { ErrorService } from 'src/app/services/error.service';

@Component({
  templateUrl: './kyc.component.html',
  styleUrls: ['./profile.scss']
})
export class KycPersonalComponent implements OnInit, OnDestroy {
  private pSettingsSubscription!: any;
  inProgress = false;
  errorMessage = '';
  flow = '';
  settingsCommon: SettingsCommon | null = null;

  constructor(private router: Router,
    private auth: AuthService, private errorHandler: ErrorService) {
    this.settingsCommon = this.auth.getLocalSettingsCommon();
  }

  ngOnInit(): void {
    const kycData = this.auth.getMyKycSettings();
    if (kycData === null) {
      this.errorMessage = this.errorHandler.getRejectedCookieMessage();
    } else if (this.settingsCommon === null) {
      this.errorMessage = 'Unable to load common settings';
    } else {
      this.inProgress = true;
      this.pSettingsSubscription = kycData.valueChanges.subscribe(({ data }) => {
        const settingsKyc: SettingsKycShort | null = data.mySettingsKyc;
        if (settingsKyc === null) {
          this.errorMessage = 'Unable to load user identification settings';
        } else {
          const levels = settingsKyc.levels?.map((val) => new KycLevelShort(val)) as KycLevelShort[];
          if (levels.length > 0) {
            const level = levels[0];
            this.flow = level.flowData.value;
          }
          this.inProgress = false;
        }
      }, (error) => {
        this.inProgress = false;
        if (this.auth.token !== '') {
          this.errorMessage = this.errorHandler.getError(error.message, 'Unable to load settings');
        } else {
          this.router.navigateByUrl('/');
        }
      });
    }
  }

  ngOnDestroy(): void {
    const s: Subscription = this.pSettingsSubscription;
    if (s !== undefined) {
      (this.pSettingsSubscription as Subscription).unsubscribe();
    }
  }

  getUserMainPage(): string {
    return this.auth.getUserMainPage();
  }
}
