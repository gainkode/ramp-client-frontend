import { AfterViewInit, Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { MatSort } from '@angular/material/sort';
import { Router } from '@angular/router';
import { NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { Subscription } from 'rxjs';
import { take } from 'rxjs/operators';
import { Clipboard } from '@angular/cdk/clipboard';
import { AdminDataService } from 'services/admin-data.service';
import { ApiKeyItem } from 'model/apikey.model';
import { AuthService } from 'services/auth.service';

@Component({
  selector: 'app-admin-apikeys',
  templateUrl: 'apikeys.component.html',
  styleUrls: ['apikeys.component.scss']
})
export class AdminApiKeysComponent implements OnInit, OnDestroy, AfterViewInit {
  @ViewChild(MatSort) sort!: MatSort;

  displayedColumns: string[] = [
    'lock',
    'title',
    'user',
    'created',
    'delete'
  ];
  inProgress = false;
  errorMessage = '';
  permission = 0;
  apiKeys: ApiKeyItem[] = [];
  selectedKey: ApiKeyItem | undefined = undefined;
  apiKey = '';
  secret = '';
  keyCount = 0;
  pageSize = 50;
  pageIndex = 0;
  sortedField = 'created';
  sortedDesc = true;

  private subscriptions: Subscription = new Subscription();
  private detailsDialog: NgbModalRef | undefined = undefined;
  private createDialog: NgbModalRef | undefined = undefined;

  constructor(
    private modalService: NgbModal,
    private auth: AuthService,
    private adminService: AdminDataService,
    private clipboard: Clipboard,
    private router: Router
  ) {
    this.permission = this.auth.isPermittedObjectCode('SETTINGS');
  }

  ngOnInit(): void {
    this.loadKeys();
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  ngAfterViewInit() {
    this.subscriptions.add(
      this.sort.sortChange.subscribe(() => {
        this.sortedDesc = (this.sort.direction === 'desc');
        this.sortedField = this.sort.active;
        this.loadKeys();
      })
    );
  }

  handlePage(index: number): void {
    this.pageIndex = index - 1;
    this.loadKeys();
  }

  addKey(content: any): void {
    this.detailsDialog = this.modalService.open(content, {
      backdrop: 'static',
      windowClass: 'modalCusSty',
    });
  }

  deleteKey(key: ApiKeyItem, content: any): void {
    this.selectedKey = key;
    this.createDialog = this.modalService.open(content, {
      backdrop: 'static',
      windowClass: 'modalCusSty',
    });
    this.subscriptions.add(
      this.createDialog.closed.subscribe(val => {
        this.removeApiKeyConfirmed(key.title);
      })
    );
  }

  private removeApiKeyConfirmed(apiKey: string): void {
    this.errorMessage = '';
    const deleteKeyData$ = this.adminService.deleteApiKey(apiKey);
    this.subscriptions.add(
      deleteKeyData$.subscribe(({ data }) => {
        this.loadKeys();
      }, (error) => {
        this.errorMessage = error;
      })
    );
  }

  private loadKeys(): void {
    let sf = this.sortedField;
    if (sf === '') {
      sf = 'created';
    } else if (sf === 'title') {
      sf = 'apiKeyId';
    }
    this.apiKeys = [];
    this.inProgress = true;
    const listData$ = this.adminService.getApiKeys(
      this.pageIndex,
      this.pageSize,
      sf,
      this.sortedDesc).pipe(take(1));
    this.subscriptions.add(
      listData$.subscribe(({ list, count }) => {
        this.apiKeys = list;
        this.keyCount = count;
        this.inProgress = false;
      }, (error) => {
        this.inProgress = false;
        if (this.auth.token === '') {
          this.router.navigateByUrl('/');
        }
      })
    );
  }

  onSaveKey(keyData: string, content: any): void {
    const data = keyData.split('|');
    this.apiKey = data[0];
    this.secret = data[1];
    if (this.detailsDialog) {
      this.detailsDialog.close();
      this.modalService.open(content, {
        backdrop: 'static',
        windowClass: 'modalCusSty',
      });
      this.loadKeys();
    }
  }

  copySecret(secret: string): void {
    this.clipboard.copy(secret);
  }
}
