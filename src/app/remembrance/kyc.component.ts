import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { SettingsCommon, SettingsKycShort, User } from 'src/app/model/generated-models';
import { KycLevelShort } from 'src/app/model/identification.model';
import { AuthService } from 'src/app/services/auth.service';
import { ErrorService } from 'src/app/services/error.service';

@Component({
  templateUrl: './kyc.component.html',
  styleUrls: ['./profile.scss']
})
export class KycPersonalComponent implements OnInit, OnDestroy {
  private _settingsSubscription!: any;
  user: User | null = null;
  inProgress = false;
  errorMessage = '';
  levels: KycLevelShort[] = [];
  settingsCommon: SettingsCommon | null = null;
  selectedLevelId = '';
  changeEditModeRef: any;

  getDescription(description: string | undefined): string {
    return description as string;
  }

  constructor(private router: Router,
    private auth: AuthService, private errorHandler: ErrorService) {
    this.user = auth.user;
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
      this._settingsSubscription = kycData.valueChanges.subscribe(({ data }) => {
        const settingsKyc: SettingsKycShort | null = data.mySettingsKyc;
        if (settingsKyc === null) {
          this.errorMessage = 'Unable to load user identification settings';
        } else {
          this.levels = settingsKyc.levels?.map((val) => new KycLevelShort(val)) as KycLevelShort[];
          if (this.levels.length > 0 && this.selectedLevelId === '') {
            this.selectLevel(this.levels[0].id);
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
    const s: Subscription = this._settingsSubscription;
    if (s !== undefined) {
      (this._settingsSubscription as Subscription).unsubscribe();
    }
  }

  onActivate(component: any): void {
    this.changeEditModeRef = component.setLevelId;
    if (this.changeEditModeRef !== undefined) {
      this.changeEditModeRef.subscribe((event: any) => {
        this.selectedLevelId = event as string;
        component.url = this.settingsCommon?.kycBaseAddress as string;
      });
    }
  }

  onDeactivate(component: any): void {
    if (this.changeEditModeRef !== undefined) {
      this.changeEditModeRef.unsubscribe();
    }
  }

  selectLevel(id: string | undefined): void {
    const path = 'personal/kyc/wizard';
    const url = (id === undefined) ? path : `${path}/${id}`;
    this.router.navigateByUrl('/', { skipLocationChange: true }).then(() =>
      this.router.navigate([url]));
  }
}
