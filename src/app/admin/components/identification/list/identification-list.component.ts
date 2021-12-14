import { Component, OnInit, OnDestroy, Output, EventEmitter } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../../../services/auth.service';
import { AdminDataService } from '../../../services/admin-data.service';
import { ErrorService } from '../../../../services/error.service';
import { Subject, Subscription } from 'rxjs';
import { KycLevel, KycScheme } from 'src/app/model/identification.model';
import { takeUntil } from 'rxjs/operators';

@Component({
  templateUrl: 'identification-list.component.html',
  styleUrls: ['identification-list.component.scss']
})
export class IdentificationListComponent implements OnInit, OnDestroy {
  @Output() changeEditMode = new EventEmitter<boolean>();
  private pSettingsSubscription!: any;
  private pLevelsSubscription!: any;
  private pEditMode = false;
  inProgress = false;
  errorMessage = '';
  levelEditorErrorMessage = '';
  schemeEditorErrorMessage = '';
  selectedTab = 0;
  createScheme = false;
  createLevel = false;
  selectedScheme: KycScheme | null = null;
  selectedLevel: KycLevel | null = null;
  schemes: KycScheme[] = [];
  levels: KycLevel[] = [];

  private destroy$ = new Subject();
  private schemesSubscription = Subscription.EMPTY;
  private levelsSubscription = Subscription.EMPTY;

  get editMode(): boolean {
    return this.pEditMode;
  }

  constructor(
    private auth: AuthService,
    private errorHandler: ErrorService,
    private adminService: AdminDataService,
    private router: Router) {
  }

  ngOnInit(): void {
    this.loadData();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
  }

  setSelectedTab(index: number): void {
    this.onCancelEdit();
    this.selectedTab = index;
    this.loadData();
  }

  loadData(): void {
    this.showSchemeEditor(null, false, false);
    if (this.selectedTab === 0) {
      // Levels
      const s: Subscription = this.pLevelsSubscription;
      if (s !== undefined) {
        this.refreshLevelList();
      } else {
        this.loadLevelList();
      }
    } else {
      // Schemes
      const s: Subscription = this.pSettingsSubscription;
      if (s !== undefined) {
        this.refreshSchemeList();
      } else {
        this.loadSchemeList();
      }
    }
  }

  loadSchemeList(): void {
    this.schemesSubscription.unsubscribe();

    this.schemesSubscription = this.adminService.getKycSettings()
                                   .pipe(takeUntil(this.destroy$))
                                   .subscribe(data => {
                                     this.schemes = data.list;
                                   });
  }

  refreshSchemeList(): void {
    const settingsData = this.adminService.getKycSettings();
    if (settingsData !== null) {
      this.loadSchemeList();
    }
  }

  loadLevelList(): void {

    this.levelsSubscription.unsubscribe();

    this.levelsSubscription = this.adminService.getKycLevels(null)
                                  .pipe(takeUntil(this.destroy$))
                                   .subscribe(data => {
                                     this.levels = data.list;
                                   });
  }

  refreshLevelList(): void {
      this.loadLevelList();
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
    if (visible) {
      this.selectedScheme = scheme ?? new KycScheme(null);
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
    if (visible) {
      this.selectedLevel = level ?? new KycLevel(null);
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

  createNewLevel(): void {
    this.showLevelEditor(null, true, true);
  }

  onEditorFormChanged(mode: boolean): void {
    this.setEditMode(mode);
  }

  onCancelEdit(): void {
    this.createScheme = false;
    this.createLevel = false;
    this.showSchemeEditor(null, false, false);
    this.showLevelEditor(null, false, false);
    this.setEditMode(false);
  }

  onDeleteScheme(id: string): void {
    this.schemeEditorErrorMessage = '';
    const requestData = this.adminService.deleteKycSettings(id);
    if (requestData === null) {
      this.errorMessage = this.errorHandler.getRejectedCookieMessage();
    } else {
      this.inProgress = true;
      requestData.subscribe(({ data }) => {
        this.inProgress = false;
        this.showSchemeEditor(null, false, false);
        this.refreshSchemeList();
      }, (error) => {
        this.inProgress = false;
        if (this.auth.token !== '') {
          this.schemeEditorErrorMessage = this.errorHandler.getError(error.message,
            'Unable to delete identification settings');
        } else {
          this.router.navigateByUrl('/');
        }
      });
    }
  }

  onDeleteLevel(id: string): void {
    this.levelEditorErrorMessage = '';
    const requestData = this.adminService.deleteKycLevelSettings(id);
    if (requestData === null) {
      this.errorMessage = this.errorHandler.getRejectedCookieMessage();
    } else {
      this.inProgress = true;
      requestData.subscribe(({ data }) => {
        this.inProgress = false;
        this.showLevelEditor(null, false, false);
        this.refreshLevelList();
      }, (error) => {
        this.inProgress = false;
        if (this.auth.token !== '') {
          this.levelEditorErrorMessage = this.errorHandler.getError(error.message,
            'Unable to delete identification level');
        } else {
          this.router.navigateByUrl('/');
        }
      });
    }
  }

  onSavedScheme(scheme: KycScheme): void {
    this.schemeEditorErrorMessage = '';
    this.inProgress = true;
    this.adminService.saveKycSettings(scheme, this.createScheme)
        .subscribe(({ data }) => {
          this.inProgress = false;
          this.setEditMode(false);
          this.showSchemeEditor(null, false, false);
          this.createScheme = false;
          this.refreshSchemeList();
        }, (error) => {
          this.inProgress = false;
          if (this.auth.token !== '') {
            this.schemeEditorErrorMessage = this.errorHandler.getError(error.message,
              'Unable to save identification settings');
          } else {
            this.router.navigateByUrl('/');
          }
        });
  }

  onSavedLevel(level: KycLevel): void {
    this.levelEditorErrorMessage = '';
    this.inProgress = true;
    this.adminService.saveKycLevelSettings(level, this.createLevel)
        .subscribe(({ data }) => {
          this.inProgress = false;
          this.setEditMode(false);
          this.showLevelEditor(null, false, false);
          this.createLevel = false;
          this.refreshLevelList();
        }, (error) => {
          this.inProgress = false;
          if (this.auth.token !== '') {
            this.levelEditorErrorMessage = this.errorHandler.getError(error.message,
              'Unable to save identification level');
          } else {
            this.router.navigateByUrl('/');
          }
        });
  }

  handleDetailsPanelClosed(): void {
    this.selectedScheme = null;
    this.selectedLevel = null;
  }
}
