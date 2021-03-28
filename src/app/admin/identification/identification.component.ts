import { Component, OnInit, OnDestroy, Output, EventEmitter } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { AdminDataService } from '../../services/admin-data.service';
import { ErrorService } from '../../services/error.service';
import { SettingsKycListResult } from '../../model/generated-models';
import { Subscription } from 'rxjs';
import { KycScheme } from 'src/app/model/identification.model';

@Component({
  templateUrl: 'identification.component.html',
  styleUrls: ['../admin.scss', 'identification.component.scss']
})
export class IdentificationComponent implements OnInit, OnDestroy {
  @Output() changeEditMode = new EventEmitter<boolean>();
  private _showDetails = false;
  private _settingsSubscription!: any;
  private _editMode = false;
  inProgress = false;
  errorMessage = '';
  editorErrorMessage = '';
  createScheme = false;
  selectedScheme: KycScheme | null = null;
  schemes: KycScheme[] = [];
  displayedColumns: string[] = ['isDefault', 'name', 'target', 'userType', 'userMode', 'provider', 'details'];

  get showDetailed(): boolean {
    return this._showDetails;
  }

  get editMode(): boolean {
    return this._editMode;
  }

  constructor(private auth: AuthService, private errorHandler: ErrorService,
    private adminService: AdminDataService, private router: Router) {
  }

  ngOnInit(): void {
    const settingsData = this.adminService.getKycSettings();
    if (settingsData === null) {
      this.errorMessage = this.errorHandler.getRejectedCookieMessage();
    } else {
      this.inProgress = true;
      this._settingsSubscription = settingsData.valueChanges.subscribe(({ data }) => {
        const settings = data.getSettingsKyc as SettingsKycListResult;
        let itemCount = 0;
        if (settings !== null) {
          itemCount = settings?.count as number;
          if (itemCount > 0) {
            this.schemes = settings?.list?.map((val) => new KycScheme(val)) as KycScheme[];
          }
        }
        this.inProgress = false;
      }, (error) => {
        this.setEditMode(false);
        this.inProgress = false;
        if (this.auth.token !== '') {
          this.errorMessage = this.errorHandler.getError(error.message, 'Unable to load identification settings');
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

  refresh(): void {
    const settingsData = this.adminService.getKycSettings();
    if (settingsData !== null) {
      settingsData.refetch();
    }
  }

  private setEditMode(mode: boolean): void {
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

  private showEditor(scheme: KycScheme | null, createNew: boolean, visible: boolean): void {
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

  toggleDetails(scheme: KycScheme): void {
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
    // this.editorErrorMessage = '';
    // const requestData = this.adminService.deleteCostSettings(id);
    // if (requestData === null) {
    //   this.errorMessage = this.errorHandler.getRejectedCookieMessage();
    // } else {
    //   this.inProgress = true;
    //   requestData.subscribe(({ data }) => {
    //     this.inProgress = false;
    //     this.showEditor(null, false, false);
    //     this.refresh();
    //   }, (error) => {
    //     this.inProgress = false;
    //     console.log(error);
    //     if (this.auth.token !== '') {
    //       this.editorErrorMessage = this.errorHandler.getError(error.message, 'Unable to delete identification settings');
    //     } else {
    //       this.router.navigateByUrl('/');
    //     }
    //   });
    // }
  }

  onSaved(scheme: KycScheme): void {
    this.editorErrorMessage = '';
    // this.inProgress = true;
    // this.adminService.saveCostSettings(scheme, this.createScheme).subscribe(({ data }) => {
    //   this.inProgress = false;
    //   this.setEditMode(false);
    //   this.showEditor(null, false, false);
    //   this.createScheme = false;
    //   this.refresh();
    // }, (error) => {
    //   this.inProgress = false;
    //   console.log(error);
    //   if (this.auth.token !== '') {
    //     this.editorErrorMessage = this.errorHandler.getError(error.message, 'Unable to save identification settings');
    //   } else {
    //     this.router.navigateByUrl('/');
    //   }
    // });
  }
}
