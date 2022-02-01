import { Component, OnInit, OnDestroy, Output, EventEmitter } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../../../services/auth.service';
import { AdminDataService } from '../../../services/admin-data.service';
import { ErrorService } from '../../../../services/error.service';
import { Subscription } from 'rxjs';
import { KycLevel, KycScheme } from 'src/app/model/identification.model';
import { take } from 'rxjs/operators';
import { LayoutService } from 'src/app/admin/services/layout.service';
import { CommonTargetValue } from 'src/app/model/common.model';
import { CountryFilterList, getCountry, getCountryByCode2, getCountryByCode3 } from 'src/app/model/country-code.model';
import { BlackCountryListResult } from 'src/app/model/generated-models';

@Component({
  templateUrl: 'identification-list.component.html',
  styleUrls: ['identification-list.component.scss']
})
export class IdentificationListComponent implements OnInit, OnDestroy {
  @Output() changeEditMode = new EventEmitter<boolean>();
  private pEditMode = false;
  inProgress = false;
  errorMessage = '';
  levelEditorErrorMessage = '';
  schemeEditorErrorMessage = '';
  blackListEditorErrorMessage = '';
  selectedTab = 0;
  createScheme = false;
  createLevel = false;
  createBlackItem = false;
  selectedScheme: KycScheme | null = null;
  selectedLevel: KycLevel | null = null;
  selectedBlackItem: CommonTargetValue | null = null;
  schemes: KycScheme[] = [];
  levels: KycLevel[] = [];
  blackList: CommonTargetValue[] = [];

  private subscriptions: Subscription = new Subscription();

  get editMode(): boolean {
    return this.pEditMode;
  }

  constructor(
    private layoutService: LayoutService,
    private auth: AuthService,
    private errorHandler: ErrorService,
    private adminService: AdminDataService,
    private router: Router) {
  }

  ngOnInit(): void {
    this.subscriptions.add(
      this.layoutService.rightPanelCloseRequested$.subscribe(() => {
        this.onCancelEdit();
      })
    );
    this.loadData();
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
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
      this.loadLevelList();
    } else if (this.selectedTab === 1) {
      // Schemes
      this.loadSchemeList();
    } else {
      // Black list
      this.loadBlackListList();
    }
  }

  loadSchemeList(): void {
    const listData$ = this.adminService.getKycSettings().pipe(take(1));
    this.subscriptions.add(
      listData$.subscribe(data => {
        this.schemes = data.list;
      })
    );
  }

  loadLevelList(): void {
    const listData$ = this.adminService.getKycLevels(null).pipe(take(1));
    this.subscriptions.add(
      listData$.subscribe(data => {
        this.levels = data.list;
      })
    );
  }

  loadBlackListList(): void {
    const listData$ = this.adminService.getCountryBlackList().valueChanges.pipe(take(1));
    this.subscriptions.add(
      listData$.subscribe(({ data }) => {
        const responseData = data.getCountryBlackList as BlackCountryListResult;
        let itemCount = 0;
        if (responseData !== null) {
          itemCount = responseData?.count ?? 0;
          if (itemCount > 0) {
            this.blackList = responseData?.list?.map((val) => {
              const c = getCountryByCode2(val.countryCode2);
              return {
                id: c?.code3 ?? '',
                title: c?.name ?? ''
              }
            }) as CommonTargetValue[];
          }
        }
      })
    );
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

  private isSelectedBlackItem(itemId: string): boolean {
    let selected = false;
    if (this.selectedBlackItem !== null) {
      if (this.selectedBlackItem.id === itemId) {
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

  private showBlackListEditor(item: CommonTargetValue | null, createNew: boolean, visible: boolean): void {
    if (visible) {
      this.selectedBlackItem = item ?? {
        id: '',
        title: ''
      } as CommonTargetValue;
      this.createBlackItem = createNew;
      if (createNew) {
        this.setEditMode(true);
      }
    } else {
      this.selectedBlackItem = null;
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

  toggleBlackItemDetails(item: CommonTargetValue): void {
    let show = true;
    if (this.isSelectedBlackItem(item.id)) {
      show = false;
    }
    this.showBlackListEditor(item, false, show);
  }

  createNewScheme(): void {
    this.showSchemeEditor(null, true, true);
  }

  createNewLevel(): void {
    this.showLevelEditor(null, true, true);
  }

  createNewBlackItem(): void {
    this.showBlackListEditor(null, true, true);
  }

  onEditorFormChanged(mode: boolean): void {
    this.setEditMode(mode);
  }

  onCancelEdit(): void {
    this.createScheme = false;
    this.createLevel = false;
    this.createBlackItem = false;
    this.showSchemeEditor(null, false, false);
    this.showLevelEditor(null, false, false);
    this.showBlackListEditor(null, false, false);
    this.setEditMode(false);
  }

  onDeleteScheme(id: string): void {
    this.schemeEditorErrorMessage = '';
    this.inProgress = true;
    const requestData$ = this.adminService.deleteKycSettings(id);
    this.subscriptions.add(
      requestData$.subscribe(({ data }) => {
        this.inProgress = false;
        this.showSchemeEditor(null, false, false);
        this.loadSchemeList();
      }, (error) => {
        this.inProgress = false;
        if (this.auth.token !== '') {
          this.schemeEditorErrorMessage = this.errorHandler.getError(error.message,
            'Unable to delete identification settings');
        } else {
          this.router.navigateByUrl('/');
        }
      })
    );
  }

  onDeleteLevel(id: string): void {
    this.levelEditorErrorMessage = '';
    this.inProgress = true;
    const requestData$ = this.adminService.deleteKycLevelSettings(id);
    this.subscriptions.add(
      requestData$.subscribe(({ data }) => {
        this.inProgress = false;
        this.showLevelEditor(null, false, false);
        this.loadLevelList();
      }, (error) => {
        this.inProgress = false;
        if (this.auth.token !== '') {
          this.levelEditorErrorMessage = this.errorHandler.getError(error.message,
            'Unable to delete identification level');
        } else {
          this.router.navigateByUrl('/');
        }
      })
    );
  }

  onDeleteBlackItem(id: string): void {
    const c = getCountryByCode3(id);
    if (c) {
      this.blackListEditorErrorMessage = '';
      this.inProgress = true;
      const requestData$ = this.adminService.deleteBlackCountry(c.code2);
      this.subscriptions.add(
        requestData$.subscribe(({ data }) => {
          this.inProgress = false;
          this.showBlackListEditor(null, false, false);
          this.loadBlackListList();
        }, (error) => {
          this.inProgress = false;
          if (this.auth.token !== '') {
            this.blackListEditorErrorMessage = this.errorHandler.getError(error.message,
              'Unable to remove a country from the black list');
          } else {
            this.router.navigateByUrl('/');
          }
        })
      );
    }
  }

  onSavedScheme(scheme: KycScheme): void {
    this.schemeEditorErrorMessage = '';
    this.inProgress = true;
    const requestData$ = this.adminService.saveKycSettings(scheme, this.createScheme);
    this.subscriptions.add(
      requestData$.subscribe(({ data }) => {
        this.inProgress = false;
        this.setEditMode(false);
        this.showSchemeEditor(null, false, false);
        this.createScheme = false;
        this.loadSchemeList();
      }, (error) => {
        this.inProgress = false;
        if (this.auth.token !== '') {
          this.schemeEditorErrorMessage = this.errorHandler.getError(error.message,
            'Unable to save identification settings');
        } else {
          this.router.navigateByUrl('/');
        }
      })
    );
  }

  onSavedLevel(level: KycLevel): void {
    this.levelEditorErrorMessage = '';
    this.inProgress = true;
    const requestData$ = this.adminService.saveKycLevelSettings(level, this.createLevel);
    this.subscriptions.add(
      requestData$.subscribe(({ data }) => {
        this.inProgress = false;
        this.setEditMode(false);
        this.showLevelEditor(null, false, false);
        this.createLevel = false;
        this.loadLevelList();
      }, (error) => {
        this.inProgress = false;
        if (this.auth.token !== '') {
          this.levelEditorErrorMessage = this.errorHandler.getError(error.message,
            'Unable to save identification level');
        } else {
          this.router.navigateByUrl('/');
        }
      })
    );
  }

  onSavedBlackItem(item: CommonTargetValue): void {
    this.blackListEditorErrorMessage = '';
    this.inProgress = true;
    const c = getCountryByCode3(item.id);
    if (c) {
      const requestData$ = this.adminService.addBlackCountry(c.code2);
      this.subscriptions.add(
        requestData$.subscribe(({ data }) => {
          this.inProgress = false;
          this.setEditMode(false);
          this.showBlackListEditor(null, false, false);
          this.createBlackItem = false;
          this.loadBlackListList();
        }, (error) => {
          this.inProgress = false;
          if (this.auth.token !== '') {
            this.blackListEditorErrorMessage = this.errorHandler.getError(error.message,
              'Unable to add a country to the black list');
          } else {
            this.router.navigateByUrl('/');
          }
        })
      );
    }
  }

  handleDetailsPanelClosed(): void {
    this.selectedScheme = null;
    this.selectedLevel = null;
    this.selectedBlackItem = null;
  }
}
