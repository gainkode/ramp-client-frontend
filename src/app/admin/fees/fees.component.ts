import { Component, OnInit, OnDestroy, Output, EventEmitter } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { AdminDataService } from '../../services/admin-data.service';
import { ErrorService } from '../../services/error.service';
import { FeeScheme } from '../../model/fee-scheme.model';
import { SettingsFeeListResult } from '../../model/generated-models';
import { Subscription } from 'rxjs';

@Component({
  templateUrl: 'fees.component.html',
  styleUrls: ['../admin.scss', 'fees.component.scss']
})
export class FeesComponent implements OnInit, OnDestroy {
  @Output() changeEditMode = new EventEmitter<boolean>();
  private _showDetails = false;
  private _settingsSubscription!: any;
  private _editMode: boolean = false;
  inProgress = false;
  errorMessage = '';
  editorErrorMessage = '';
  createScheme = false;
  selectedScheme: FeeScheme | null = null;
  schemes: FeeScheme[] = [];
  displayedColumns: string[] = ['isDefault', 'name', 'target', 'trxType', 'instrument', 'provider', 'details'];

  get showDetailed(): boolean {
    return this._showDetails;
  }

  constructor(private auth: AuthService, private errorHandler: ErrorService,
    private adminService: AdminDataService, private router: Router) {
  }

  ngOnInit(): void {
    this.inProgress = true;
    this._settingsSubscription = this.adminService.getFeeSettings().valueChanges.subscribe(({ data }) => {
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
    (this._settingsSubscription as Subscription).unsubscribe();
  }

  refresh() {
    this.adminService.getFeeSettings().refetch();
  }

  private setEditMode(mode: boolean) {
    this._editMode = mode;
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
      return (this.isSelectedScheme(schemeId)) ? 'Close details' : 'Change scheme';
    }
  }

  private showEditor(scheme: FeeScheme | null, createNew: boolean, visible: boolean) {
    this._showDetails = visible;
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

  toggleDetails(scheme: FeeScheme): void {
    let show = true;
    if (this.isSelectedScheme(scheme.id)) {
      show = false;
    }
    this.showEditor(scheme, false, show);
  }

  createNewScheme(): void {
    this.showEditor(null, true, true);
  }

  onEditorFormChanged(mode: boolean) {
    this.setEditMode(mode);
  }

  onCancelEdit(): void {
    this.createScheme = false;
    this.showEditor(null, false, false);
    this.setEditMode(false);
  }

  onDeleteScheme(id: string) {
    this.editorErrorMessage = '';
    this.inProgress = true;
    this.adminService.deleteFeeSettings(id).subscribe(({ data }) => {
      this.inProgress = false;
      this.showEditor(null, false, false);
      this.refresh();
    }, (error) => {
      this.inProgress = false;
      console.log(error);
      if (this.auth.token !== '') {
        this.editorErrorMessage = this.errorHandler.getError(error.message, 'Unable to delete fee settings');
      } else {
        this.router.navigateByUrl('/');
      }
    });
  }

  onSaved(scheme: FeeScheme) {
    this.editorErrorMessage = '';
    this.inProgress = true;
    this.adminService.saveFeeSettings(scheme, this.createScheme).subscribe(({ data }) => {
      this.inProgress = false;
      this.setEditMode(false);
      this.showEditor(null, false, false);
      this.createScheme = false;
      this.refresh();
    }, (error) => {
      this.inProgress = false;
      console.log(error);
      if (this.auth.token !== '') {
        this.editorErrorMessage = this.errorHandler.getError(error.message, 'Unable to save fee settings');
      } else {
        this.router.navigateByUrl('/');
      }
    });
  }
}
