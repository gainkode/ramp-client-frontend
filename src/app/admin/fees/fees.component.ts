import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { AdminDataService } from '../../services/admin-data.service';
import { ErrorService } from '../../services/error.service';
import { FeeScheme } from '../../model/fee-scheme.model';
import { SettingsFeeListResult } from '../../model/generated-models';

@Component({
  templateUrl: 'fees.component.html',
  styleUrls: ['../admin.scss', 'fees.component.scss']
})
export class FeesComponent implements OnInit, OnDestroy {
  private showDetails = false;
  private settingsSubscription!: any;
  inProgress = false;
  errorMessage = '';
  selectedScheme: FeeScheme | null = null;
  createScheme = false;
  schemes: FeeScheme[] = [];

  detailsColumnIndex = 6;
  displayedColumns: string[] = ['isDefault', 'name', 'target', 'trxType', 'instrument', 'provider', 'details'];

  get showDetailed(): boolean {
    return this.showDetails;
  }

  constructor(private auth: AuthService, private errorHandler: ErrorService,
    private adminService: AdminDataService, private router: Router) {
  }

  ngOnInit(): void {
    // Load settings table
    this.inProgress = true;
    this.settingsSubscription = this.adminService.getFeeSettings().valueChanges.subscribe(({ data }) => {
      this.inProgress = false;
      const settings = data.getSettingsFee as SettingsFeeListResult;
      let itemCount = 0;
      if (settings !== null) {
        itemCount = settings?.count as number;
        if (itemCount > 0) {
          this.schemes = settings?.list?.map((val) => new FeeScheme(val)) as FeeScheme[];
        }
      }
    }, (error) => {
      this.inProgress = false;
      if (this.auth.token !== '') {
        this.errorMessage = this.errorHandler.getError(error.message, 'Unable to load fee settings');
      } else {
        this.router.navigateByUrl('/');
      }
    });
  }

  ngOnDestroy() {
    this.settingsSubscription.unsubscribe();
  }

  private showEditor(scheme: FeeScheme | null, createNew: boolean, visible: boolean) {
    this.showDetails = visible;
    if (visible) {
      this.selectedScheme = scheme;
      this.createScheme = createNew;
      this.displayedColumns.splice(this.detailsColumnIndex, 1);
    } else {
      this.displayedColumns.push('details');
    }
  }

  toggleDetails(scheme: FeeScheme): void {
    this.showDetails = !this.showDetails;
    this.showEditor(scheme, false, this.showDetails);
  }

  createNewScheme(): void {
    this.showEditor(null, true, true);
  }

  onSaved(scheme: FeeScheme) {
    this.errorMessage = '';
    this.inProgress = true;
    this.adminService.saveFeeSettings(scheme, false).subscribe(({ data }) => {
      this.inProgress = false;
      this.toggleDetails(scheme);
    }, (error) => {
      this.inProgress = false;
      if (this.auth.token !== '') {
        this.errorMessage = this.errorHandler.getError(error.message, 'Unable to save fee settings');
      } else {
        this.router.navigateByUrl('/');
      }
    });
  }
}
