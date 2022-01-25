import { Component, OnInit, OnDestroy, Output, EventEmitter } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../../../services/auth.service';
import { AdminDataService } from '../../../services/admin-data.service';
import { ErrorService } from '../../../../services/error.service';
import { Subscription } from 'rxjs';
import { KycLevel, KycScheme } from 'src/app/model/identification.model';
import { take } from 'rxjs/operators';
import { CostScheme } from 'src/app/model/cost-scheme.model';
import { SettingsCostListResult } from 'src/app/model/generated-models';

@Component({
  templateUrl: 'cost-tab-list.component.html',
  styleUrls: ['cost-tab-list.component.scss']
})
export class CostTabListComponent implements OnInit, OnDestroy {
  @Output() changeEditMode = new EventEmitter<boolean>();
  private pEditMode = false;
  inProgress = false;
  errorMessage = '';
  schemeEditorErrorMessage = '';
  accountEditorErrorMessage = '';
  selectedTab = 0;
  createAccount = false;
  createScheme = false;
  selectedAccount: KycScheme | null = null;
  selectedScheme: CostScheme | null = null;
  accounts: KycScheme[] = [];
  schemes: CostScheme[] = [];

  private subscriptions: Subscription = new Subscription();

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
    this.subscriptions.unsubscribe();
  }

  setSelectedTab(index: number): void {
    this.onCancelEdit();
    this.selectedTab = index;
    this.loadData();
  }

  loadData(): void {
    this.showAccountEditor(null, false, false);
    if (this.selectedTab === 0) {
      // schemes
      this.loadSchemeList();
    } else {
      // Accounts
      this.loadAccountList();
    }
  }

  loadAccountList(): void {
    const listData$ = this.adminService.getKycSettings().pipe(take(1));
    this.subscriptions.add(
      listData$.subscribe(data => {
        this.accounts = data.list;
      })
    );
  }

  loadSchemeList(): void {
    const listData$ = this.adminService.getCostSettings().valueChanges.pipe(take(1));
    this.inProgress = true;
    this.subscriptions.add(
      listData$.subscribe(({ data }) => {
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
      })
    );
  }

  private setEditMode(mode: boolean): void {
    this.pEditMode = mode;
    this.changeEditMode.emit(mode);
  }

  private isSelectedAccount(accountId: string): boolean {
    let selected = false;
    if (this.selectedAccount !== null) {
      if (this.selectedAccount.id === accountId) {
        selected = true;
      }
    }
    return selected;
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

  private showAccountEditor(account: KycScheme | null, createNew: boolean, visible: boolean): void {
    if (visible) {
      this.selectedAccount = account ?? new KycScheme(null);
      this.createAccount = createNew;
      if (createNew) {
        this.setEditMode(true);
      }
    } else {
      this.selectedAccount = null;
      this.setEditMode(false);
    }
  }

  private showSchemeEditor(scheme: CostScheme | null, createNew: boolean, visible: boolean): void {
    if (visible) {
      this.selectedScheme = scheme ?? new CostScheme(null);
      this.createScheme = createNew;
      if (createNew) {
        this.setEditMode(true);
      }
    } else {
      this.selectedScheme = null;
      this.setEditMode(false);
    }
  }

  toggleAccountDetails(account: KycScheme): void {
    let show = true;
    if (this.isSelectedAccount(account.id)) {
      show = false;
    }
    this.showAccountEditor(account, false, show);
  }

  toggleSchemeDetails(scheme: CostScheme): void {
    let show = true;
    if (this.isSelectedScheme(scheme.id)) {
      show = false;
    }
    this.showSchemeEditor(scheme, false, show);
  }

  createNewAccount(): void {
    this.showAccountEditor(null, true, true);
  }

  createNewScheme(): void {
    this.showSchemeEditor(null, true, true);
  }

  onEditorFormChanged(mode: boolean): void {
    this.setEditMode(mode);
  }

  onCancelEdit(): void {
    this.createAccount = false;
    this.createScheme = false;
    this.showAccountEditor(null, false, false);
    this.showSchemeEditor(null, false, false);
    this.setEditMode(false);
  }

  onDeleteAccount(id: string): void {
    this.accountEditorErrorMessage = '';
    this.inProgress = true;
    const requestData$ = this.adminService.deleteKycSettings(id);
    this.subscriptions.add(
      requestData$.subscribe(({ data }) => {
        this.inProgress = false;
        this.showAccountEditor(null, false, false);
        this.loadAccountList();
      }, (error) => {
        this.inProgress = false;
        if (this.auth.token !== '') {
          this.accountEditorErrorMessage = this.errorHandler.getError(error.message,
            'Unable to delete identification settings');
        } else {
          this.router.navigateByUrl('/');
        }
      })
    );
  }

  onDeleteScheme(id: string): void {
    this.schemeEditorErrorMessage = '';
    const requestData$ = this.adminService.deleteCostSettings(id);
    this.inProgress = true;
    this.subscriptions.add(
      requestData$.subscribe(({ data }) => {
        this.inProgress = false;
        this.showSchemeEditor(null, false, false);
        this.loadSchemeList();
      }, (error) => {
        this.inProgress = false;
        if (this.auth.token !== '') {
          this.schemeEditorErrorMessage = this.errorHandler.getError(error.message, 'Unable to delete cost settings');
        } else {
          this.router.navigateByUrl('/');
        }
      })
    );
  }

  onSavedAccount(account: KycScheme): void {
    this.accountEditorErrorMessage = '';
    this.inProgress = true;
    const requestData$ = this.adminService.saveKycSettings(account, this.createAccount);
    this.subscriptions.add(
      requestData$.subscribe(({ data }) => {
        this.inProgress = false;
        this.setEditMode(false);
        this.showAccountEditor(null, false, false);
        this.createAccount = false;
        this.loadAccountList();
      }, (error) => {
        this.inProgress = false;
        if (this.auth.token !== '') {
          this.accountEditorErrorMessage = this.errorHandler.getError(error.message,
            'Unable to save identification settings');
        } else {
          this.router.navigateByUrl('/');
        }
      })
    );
  }

  onSavedScheme(scheme: CostScheme): void {
    this.schemeEditorErrorMessage = '';
    this.inProgress = true;
    const requestData$ = this.adminService.saveCostSettings(scheme, this.createScheme)
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
          this.schemeEditorErrorMessage = this.errorHandler.getError(error.message, 'Unable to save cost settings');
        } else {
          this.router.navigateByUrl('/');
        }
      })
    );
  }

  handleDetailsPanelClosed(): void {
    this.selectedAccount = null;
    this.selectedScheme = null;
  }
}
