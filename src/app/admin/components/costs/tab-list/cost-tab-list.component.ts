import { Component, OnInit, OnDestroy, Output, EventEmitter } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../../../services/auth.service';
import { AdminDataService } from '../../../services/admin-data.service';
import { ErrorService } from '../../../../services/error.service';
import { Subscription } from 'rxjs';
import { take } from 'rxjs/operators';
import { CostScheme, WireTransferBankAccountItem } from 'src/app/model/cost-scheme.model';
import { SettingsCostListResult, WireTransferBankAccount, WireTransferBankAccountListResult } from 'src/app/model/generated-models';
import { LayoutService } from 'src/app/admin/services/layout.service';

@Component({
  templateUrl: 'cost-tab-list.component.html',
  styleUrls: ['cost-tab-list.component.scss']
})
export class CostTabListComponent implements OnInit, OnDestroy {
  @Output() changeEditMode = new EventEmitter<boolean>();

  permission = 0;
  inProgress = false;
  errorMessage = '';
  schemeEditorErrorMessage = '';
  accountEditorErrorMessage = '';
  selectedTab = 0;
  createAccount = false;
  createScheme = false;
  selectedAccount: WireTransferBankAccountItem | null = null;
  selectedScheme: CostScheme | null = null;
  accounts: WireTransferBankAccountItem[] = [];
  schemes: CostScheme[] = [];

  private pEditMode = false;
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
      this.permission = this.auth.isPermittedObjectCode('COSTS');
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
    const listData$ = this.adminService.getWireTransferBankAccounts().valueChanges.pipe(take(1));
    this.errorMessage = '';
    this.inProgress = true;
    this.accounts = [];
    this.subscriptions.add(
      listData$.subscribe(({ data }) => {
        const settings = data.getWireTransferBankAccounts as WireTransferBankAccountListResult;
        let itemCount = 0;
        if (settings !== null) {
          itemCount = settings?.count ?? 0;
          if (itemCount > 0) {
            this.accounts = settings?.list?.map((val) => new WireTransferBankAccountItem(val)) as WireTransferBankAccountItem[];
          }
        }
        this.inProgress = false;
      }, (error) => {
        this.setEditMode(false);
        this.inProgress = false;
        if (this.auth.token !== '') {
          this.errorMessage = this.errorHandler.getError(error.message, 'Unable to load settings for bank accounts');
        } else {
          this.router.navigateByUrl('/');
        }
      })
    );
  }

  loadSchemeList(): void {
    const listData$ = this.adminService.getCostSettings().valueChanges.pipe(take(1));
    this.errorMessage = '';
    this.inProgress = true;
    this.schemes = [];
    this.subscriptions.add(
      listData$.subscribe(({ data }) => {
        const settings = data.getSettingsCost as SettingsCostListResult;
        let itemCount = 0;
        if (settings !== null) {
          itemCount = settings?.count ?? 0;
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

  private showAccountEditor(account: WireTransferBankAccountItem | null, createNew: boolean, visible: boolean): void {
    if (visible) {
      this.selectedAccount = account ?? new WireTransferBankAccountItem(undefined);
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

  toggleAccountDetails(account: WireTransferBankAccountItem): void {
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
    this.errorMessage = '';
    this.inProgress = true;
    const requestData$ = this.adminService.deleteBankAccountSettings(id);
    this.subscriptions.add(
      requestData$.subscribe(({ data }) => {
        this.inProgress = false;
        this.showAccountEditor(null, false, false);
        this.loadAccountList();
      }, (error) => {
        this.inProgress = false;
        if (this.auth.token !== '') {
          this.accountEditorErrorMessage = this.errorHandler.getError(error.message,
            'Unable to delete bank account settings');
        } else {
          this.router.navigateByUrl('/');
        }
      })
    );
  }

  onDeleteScheme(id: string): void {
    this.schemeEditorErrorMessage = '';
    this.errorMessage = '';
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

  onSavedAccount(account: WireTransferBankAccount): void {
    this.accountEditorErrorMessage = '';
    this.errorMessage = '';
    this.inProgress = true;
    const requestData$ = this.adminService.saveBankAccountSettings(account, this.createAccount);
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
            'Unable to save bank account settings');
        } else {
          this.router.navigateByUrl('/');
        }
      })
    );
  }

  onSavedScheme(scheme: CostScheme): void {
    this.schemeEditorErrorMessage = '';
    this.errorMessage = '';
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
