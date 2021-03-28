import { Component, OnInit, OnDestroy, Output, EventEmitter } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { AdminDataService } from '../../services/admin-data.service';
import { ErrorService } from '../../services/error.service';
import { SettingsKycLevelListResult, SettingsKycListResult } from '../../model/generated-models';
import { Subscription } from 'rxjs';
import { KycLevel, KycScheme } from 'src/app/model/identification.model';

@Component({
  templateUrl: 'identification.component.html',
  styleUrls: ['../admin.scss', 'identification.component.scss']
})
export class IdentificationComponent implements OnInit, OnDestroy {
  @Output() changeEditMode = new EventEmitter<boolean>();
  private _showDetails = false;
  private _settingsSubscription!: any;
  private _levelsSubscription!: any;
  private _editMode = false;
  inProgress = false;
  errorMessage = '';
  editorErrorMessage = '';
  selectedTab = 0;
  createScheme = false;
  createLevel = false;
  selectedScheme: KycScheme | null = null;
  selectedLevel: KycLevel | null = null;
  schemes: KycScheme[] = [];
  levels: KycLevel[] = [];

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
    this.refreshData();
  }

  ngOnDestroy(): void {
    const ss: Subscription = this._settingsSubscription;
    const ls: Subscription = this._levelsSubscription;
    if (ss !== undefined) {
      ss.unsubscribe();
    }
    if (ls !== undefined) {
      ls.unsubscribe();
    }
  }

  setSelectedTab(index: number): void {
    this.selectedTab = index;
    this.refreshData();
  }

  refreshData() {
    this.showSchemeEditor(null, false, false);
    if (this.selectedTab == 0) {
      // Schemes
      const s: Subscription = this._settingsSubscription;
      if (s !== undefined) {
        this.refreshSchemeList();
      }
      else {
        this.loadSchemeList();
      }
    } else {
      // Levels
      const s: Subscription = this._levelsSubscription;
      if (s !== undefined) {
        this.refreshLevelList();
      }
      else {
        this.loadLevelList();
      }
    }
  }

  loadSchemeList(): void {
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

  refreshSchemeList(): void {
    const settingsData = this.adminService.getKycSettings();
    if (settingsData !== null) {
      settingsData.refetch();
    }
  }

  loadLevelList(): void {
    const settingsData = this.adminService.getKycLevels();
    if (settingsData === null) {
      this.errorMessage = this.errorHandler.getRejectedCookieMessage();
    } else {
      this.inProgress = true;
      this._levelsSubscription = settingsData.valueChanges.subscribe(({ data }) => {
        const settings = data.getSettingsKycLevels as SettingsKycLevelListResult;
        let itemCount = 0;
        if (settings !== null) {
          itemCount = settings?.count as number;
          if (itemCount > 0) {
            this.levels = settings?.list?.map((val) => new KycLevel(val)) as KycLevel[];
          }
        }
        this.inProgress = false;
      }, (error) => {
        this.setEditMode(false);
        this.inProgress = false;
        if (this.auth.token !== '') {
          this.errorMessage = this.errorHandler.getError(error.message, 'Unable to load identification levels');
        } else {
          this.router.navigateByUrl('/');
        }
      });
    }
  }

  refreshLevelList(): void {
    const settingsData = this.adminService.getKycLevels();
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

  private isSelectedLevel(levelId: string): boolean {
    let selected = false;
    if (this.selectedLevel !== null) {
      if (this.selectedLevel.id === levelId) {
        selected = true;
      }
    }
    return selected;
  }

  private showSchemeEditor(scheme: KycScheme | null, createNew: boolean, visible: boolean): void {
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

  private showLevelEditor(level: KycLevel | null, createNew: boolean, visible: boolean): void {
    this._showDetails = visible;
    if (visible) {
      this.selectedLevel = level;
      this.createLevel = createNew;
      if (createNew) {
        this.setEditMode(true);
      }
    } else {
      this.selectedLevel = null;
      this.setEditMode(false);
    }
  }

  toggleSchemeDetails(scheme: KycScheme): void {
    let show = true;
    if (this.isSelectedScheme(scheme.id)) {
      show = false;
    }
    this.showSchemeEditor(scheme, false, show);
  }

  toggleLevelDetails(level: KycLevel): void {
    let show = true;
    if (this.isSelectedLevel(level.id)) {
      show = false;
    }
    this.showLevelEditor(level, false, show);
  }

  createNewScheme(): void {
    this.showSchemeEditor(null, true, true);
  }

  onEditorFormChanged(mode: boolean): void {
    this.setEditMode(mode);
  }

  onCancelEdit(): void {
    this.createScheme = false;
    this.showSchemeEditor(null, false, false);
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
    //     this.showSchemeEditor(null, false, false);
    //     this.refreshSchemeList();
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
    //   this.showSchemeEditor(null, false, false);
    //   this.createScheme = false;
    //   this.refreshSchemeList();
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
