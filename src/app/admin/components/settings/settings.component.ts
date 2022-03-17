import { Component, OnDestroy } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Subscription } from 'rxjs';
import { take } from 'rxjs/operators';
import { ApiKeyItem } from 'src/app/model/apikey.model';
import { AuthService } from 'src/app/services/auth.service';
import { AdminDataService } from '../../services/admin-data.service';

@Component({
  templateUrl: 'settings.component.html'
})
export class AdminSettingsComponent implements OnDestroy {
  permission = 0;
  selectedTab = 0;
  apiKeys: ApiKeyItem[] = [];
  
  private subscriptions: Subscription = new Subscription();

  constructor(
    private auth: AuthService,
    public dialog: MatDialog,
    private adminService: AdminDataService) {
    this.permission = this.auth.isPermittedObjectCode('SETTINGS');
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  setSelectedTab(index: number): void {
    this.selectedTab = index;
    this.loadData();
  }

  loadData(): void {
    if (this.selectedTab === 1) {
      this.loadApiKeyList();
    }
  }

  private loadApiKeyList(): void {
    // if (this.sortedField === 'title') {
    //   this.sortedField = 'apiKeyId';
    // }
    this.apiKeys = [];
    const listData$ = this.adminService.getApiKeys(
      0,//this.pageIndex,
      100,//this.pageSize,
      'created',//this.sortedField,
      false//this.sortedDesc
      ).pipe(take(1));
    this.subscriptions.add(
      listData$.subscribe(({ list, count }) => {
        console.log('getApiKeys', list);
        //this.apiKeys = list;
        //this.keyCount = count;
      })
    );
  }
}
