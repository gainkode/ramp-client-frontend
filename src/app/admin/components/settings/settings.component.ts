import { Component, OnDestroy } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Subscription } from 'rxjs';
import { take } from 'rxjs/operators';
import { ApiSecretDialogBox } from 'src/app/components/dialogs/api-secret-box.dialog';
import { DeleteDialogBox } from 'src/app/components/dialogs/delete-box.dialog';
import { ApiKeyItem } from 'src/app/model/apikey.model';
import { ListRequestFilter } from 'src/app/model/filter.model';
import { ApiKeySecret } from 'src/app/model/generated-models';
import { AuthService } from 'src/app/services/auth.service';
import { ErrorService } from 'src/app/services/error.service';
import { AdminDataService } from '../../services/admin-data.service';
import { LayoutService } from '../../services/layout.service';

@Component({
  templateUrl: 'settings.component.html',
  styleUrls: ['settings.component.scss']
})
export class AdminSettingsComponent implements OnDestroy {
  permission = 0;
  selectedTab = 0;
  apiKeys: ApiKeyItem[] = [];
  keyCount = 0;
  accountKeyErrorMessage = '';
  newApiKey = false;
  listFilter: ListRequestFilter = {
    pageIndex: 0,
    pageSize: 25,
    sortField: 'created',
    desc: true
  };

  private subscriptions: Subscription = new Subscription();

  constructor(
    private layoutService: LayoutService,
    private errorHandler: ErrorService,
    private auth: AuthService,
    public dialog: MatDialog,
    private adminService: AdminDataService) {
    this.permission = this.auth.isPermittedObjectCode('SETTINGS');
  }

  ngOnInit(): void {
    this.subscriptions.add(
      this.layoutService.rightPanelCloseRequested$.subscribe(() => {
        this.newApiKey = false;
      })
    );
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  setSelectedTab(index: number): void {
    this.newApiKey = false;
    this.selectedTab = index;
    this.loadData();
  }

  createKey(): void {
    this.newApiKey = true;
  }

  createApiKey(userId: string): void {
    this.newApiKey = false;
    this.accountKeyErrorMessage = '';
    const createKeyData$ = this.adminService.createApiKey(userId);
    this.subscriptions.add(
      createKeyData$.subscribe(({ data }) => {
        const apiKeyData = data.createUserApiKey as ApiKeySecret;
        this.loadData();
        this.dialog.open(ApiSecretDialogBox, {
          width: '500px',
          data: {
            title: 'New API key has been created',
            message: apiKeyData.secret
          }
        });
      }, (error) => {
        this.accountKeyErrorMessage = this.errorHandler.getError(error.message, 'Unable to craete API key');
      })
    );
  }

  deleteKey(item: ApiKeyItem): void {
    const dialogRef = this.dialog.open(DeleteDialogBox, {
      width: '402px',
      data: {
        title: '',
        message: `You are going to delete API key ${item.title}. Please confirm.`,
        button: 'DELETE'
      }
    });
    this.subscriptions.add(
      dialogRef.afterClosed().subscribe(result => {
        if (result === true) {
          this.removeApiKeyConfirmed(item.title);
        }
      })
    );
  }

  reload(data: ListRequestFilter): void {
    this.listFilter = data;
    this.loadApiKeyList();
  }

  handleDetailsPanelClosed(): void {
    this.newApiKey = false;
  }

  private loadData(): void {
    if (this.selectedTab === 1) {
      this.loadApiKeyList();
    }
  }

  private loadApiKeyList(): void {
    let sortField = this.listFilter.sortField;
    if (sortField === '') {
      sortField = 'created';
    } else if (sortField === 'title') {
      sortField = 'apiKeyId';
    }
    this.apiKeys = [];
    const listData$ = this.adminService.getApiKeys(
      this.listFilter.pageIndex,
      this.listFilter.pageSize,
      sortField,
      this.listFilter.desc
    ).pipe(take(1));
    this.subscriptions.add(
      listData$.subscribe(({ list, count }) => {
        this.apiKeys = list;
        this.keyCount = count;
      })
    );
  }

  private removeApiKeyConfirmed(apiKey: string): void {
    this.accountKeyErrorMessage = '';
    const deleteKeyData$ = this.adminService.deleteApiKey(apiKey);
    this.subscriptions.add(
      deleteKeyData$.subscribe(({ data }) => {
        this.loadApiKeyList();
      }, (error) => {
        this.accountKeyErrorMessage = this.errorHandler.getError(error.message, 'Unable to delete API key');
      })
    );
  }
}
