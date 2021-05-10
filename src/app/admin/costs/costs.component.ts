import { Component, OnInit, OnDestroy, Output, EventEmitter } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { AdminDataService } from '../../services/admin-data.service';
import { ErrorService } from '../../services/error.service';
import { CostScheme } from '../../model/cost-scheme.model';
import { SettingsCostListResult } from '../../model/generated-models';
import { Subscription } from 'rxjs';

@Component({
  templateUrl: 'costs.component.html',
  styleUrls: ['../admin.scss', 'costs.component.scss']
})
export class CostsComponent implements OnInit, OnDestroy {
  @Output() changeEditMode = new EventEmitter<boolean>();
  private pShowDetails = false;
  private pSettingsSubscription!: any;
  private pEditMode = false;
  inProgress = false;
  errorMessage = '';
  editorErrorMessage = '';
  createScheme = false;
  selectedScheme: CostScheme | null = null;
  schemes: CostScheme[] = [];
  displayedColumns: string[] = ['isDefault', 'name', 'target', 'trxType', 'instrument', 'provider', 'details'];

  get showDetailed(): boolean {
    return this.pShowDetails;
  }

  get editMode(): boolean {
    return this.pEditMode;
  }

  constructor(private auth: AuthService, private errorHandler: ErrorService,
    private adminService: AdminDataService, private router: Router) {
  }

  ngOnInit(): void {
    const settingsData = this.adminService.getCostSettings();
    if (settingsData === null) {
      this.errorMessage = this.errorHandler.getRejectedCookieMessage();
    } else {
      this.inProgress = true;
      this.pSettingsSubscription = settingsData.valueChanges.subscribe(({ data }) => {
        const settings = data.getSettingsCost as SettingsCostListResult;
        let itemCount = 0;
        if (settings !== null) {
          itemCount = settings?.count as number;
          if (itemCount > 0) {
            this.schemes = settings?.list?.map((val) => new CostScheme(val)) as CostScheme[];
          }
        }
        this.inProgress = false;
      }, (error) => {
        this.setEditMode(false);
        this.inProgress = false;
        if (this.auth.token !== '') {
          this.errorMessage = this.errorHandler.getError(error.message, 'Unable to load cost settings');
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

  refresh(): void {
    const settingsData = this.adminService.getCostSettings();
    if (settingsData !== null) {
      settingsData.refetch();
    }
  }

  private setEditMode(mode: boolean): void {
    this.pEditMode = mode;
    this.changeEditMode.emit(mode);
  }

  private isSelectedScheme(schemeId: string): boolean {
    let selected = false;
    if (this.selectedScheme !== null) {
      if (this.selectedScheme.id === schemeId) {
        selected = true;
      }
    }
    return selected;
  }

  getDetailsIcon(schemeId: string): string {
    if (this.createScheme) {
      return 'lock';
    } else {
      return (this.isSelectedScheme(schemeId)) ? 'clear' : 'description';
    }
  }

  getDetailsTooltip(schemeId: string): string {
    if (this.createScheme) {
      return 'Save changes first';
    } else {
      return (this.isSelectedScheme(schemeId)) ? 'Hide details' : 'Change scheme';
    }
  }

  private showEditor(scheme: CostScheme | null, createNew: boolean, visible: boolean): void {
    this.pShowDetails = visible;
    if (visible) {
      this.selectedScheme = scheme;
      this.createScheme = createNew;
      if (createNew) {
        this.setEditMode(true);
      }
    } else {
      this.selectedScheme = null;
      this.setEditMode(false);
    }
  }

  toggleDetails(scheme: CostScheme): void {
    let show = true;
    if (this.isSelectedScheme(scheme.id)) {
      show = false;
    }
    this.showEditor(scheme, false, show);
  }

  createNewScheme(): void {
    this.showEditor(null, true, true);
  }

  onEditorFormChanged(mode: boolean): void {
    this.setEditMode(mode);
  }

  onCancelEdit(): void {
    this.createScheme = false;
    this.showEditor(null, false, false);
    this.setEditMode(false);
  }

  onDeleteScheme(id: string): void {
    this.editorErrorMessage = '';
    const requestData = this.adminService.deleteCostSettings(id);
    if (requestData === null) {
      this.errorMessage = this.errorHandler.getRejectedCookieMessage();
    } else {
      this.inProgress = true;
      requestData.subscribe(({ data }) => {
        this.inProgress = false;
        this.showEditor(null, false, false);
        this.refresh();
      }, (error) => {
        this.inProgress = false;
        if (this.auth.token !== '') {
          this.editorErrorMessage = this.errorHandler.getError(error.message, 'Unable to delete cost settings');
        } else {
          this.router.navigateByUrl('/');
        }
      });
    }
  }

  onSaved(scheme: CostScheme): void {
    this.editorErrorMessage = '';
    this.inProgress = true;
    this.adminService.saveCostSettings(scheme, this.createScheme).subscribe(({ data }) => {
      this.inProgress = false;
      this.setEditMode(false);
      this.showEditor(null, false, false);
      this.createScheme = false;
      this.refresh();
    }, (error) => {
      this.inProgress = false;
      if (this.auth.token !== '') {
        this.editorErrorMessage = this.errorHandler.getError(error.message, 'Unable to save cost settings');
      } else {
        this.router.navigateByUrl('/');
      }
    });
  }
}
