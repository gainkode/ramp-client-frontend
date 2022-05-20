import { AfterViewInit, Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { MatSort } from '@angular/material/sort';
import { Router } from '@angular/router';
import { NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { Subscription } from 'rxjs';
import { take } from 'rxjs/operators';
import { Filter } from 'src/app/admin_old/model/filter.model';
import { AdminDataService } from 'src/app/admin_old/services/admin-data.service';
import { SettingsCurrencyWithDefaults, UserRole } from 'src/app/model/generated-models';
import { CurrencyView } from 'src/app/model/payment.model';
import { UserItem } from 'src/app/model/user.model';
import { AuthService } from 'src/app/services/auth.service';
import { CommonDataService } from 'src/app/services/common-data.service';
import { UserMessageData } from '../send-message/send-message.component';

@Component({
  selector: 'app-admin-customers',
  templateUrl: 'customers.component.html',
  styleUrls: ['customers.component.scss']
})
export class AdminCustomersComponent implements OnInit, OnDestroy, AfterViewInit {
  @ViewChild(MatSort) sort!: MatSort;

  filterFields = [
    'users',
    'accountType',
    'accountStatus',
    'tier',
    'riskLevel',
    'country',
    'kycStatus',
    'registrationDate',
    'widget',
    'totalBuyVolume',
    'transactionCount',
    'search'
  ];
  displayedColumns: string[] = [
    'details',
    'referralCode',
    'firstName',
    'lastName',
    'email',
    'accountStatus',
    'kycStatus',
    'widgetId',
    'totalBought',
    'totalSold',
    'totalSent',
    'totalReceived',
    'created',
    'country',
    'phone',
    'risk',
    'id'
  ];
  sendMessageInProgress = false;
  sendMessageError = '';
  inProgress = false;
  permission = 0;
  selectedCustomer?: UserItem;
  selected = false;
  customers: UserItem[] = [];
  customerCount = 0;
  currencyList: CurrencyView[] = [];
  pageSize = 50;
  pageIndex = 0;
  sortedField = 'created';
  sortedDesc = true;
  filter = new Filter({});
  roleIds: string[] = [];

  private subscriptions: Subscription = new Subscription();
  private detailsDialog: NgbModalRef | undefined = undefined;
  private messageDialog: NgbModalRef | undefined = undefined;

  constructor(
    private modalService: NgbModal,
    private auth: AuthService,
    private adminService: AdminDataService,
    private commonService: CommonDataService,
    private router: Router
  ) {
    this.permission = this.auth.isPermittedObjectCode('CUSTOMERS');
  }

  ngOnInit(): void {
    this.loadCurrencyData();
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  ngAfterViewInit() {
    this.subscriptions.add(
      this.sort.sortChange.subscribe(() => {
        this.sortedDesc = (this.sort.direction === 'desc');
        this.sortedField = this.sort.active;
        this.loadCustomers();
      })
    );
  }

  onCustomerSelected(item: UserItem): void {
    item.selected = !item.selected;
    this.selected = this.customers.some(x => x.selected === true);
  }

  showTransactions(id: string): void {
    this.router.navigateByUrl(`/admin/transactions/users/${id}`);
  }

  showWallets(id: string): void {
    this.router.navigateByUrl(`/admin/crypto-wallets/users/${id}`);
  }

  private loadCurrencyData(): void {
    this.currencyList = [];
    this.inProgress = true;
    const currencyData = this.commonService.getSettingsCurrency();
    if (currencyData) {
      this.subscriptions.add(
        currencyData.valueChanges.subscribe(({ data }) => {
          const currencySettings = data.getSettingsCurrency as SettingsCurrencyWithDefaults;
          if (currencySettings.settingsCurrency) {
            if (currencySettings.settingsCurrency.count ?? 0 > 0) {
              this.currencyList = currencySettings.settingsCurrency.list?.
                map((val) => new CurrencyView(val)) as CurrencyView[];
            }
          }
          this.loadRoleData();
        }, (error) => {
          this.inProgress = false;
          if (this.auth.token === '') {
            this.router.navigateByUrl('/');
          }
        })
      );
    }
  }

  private loadRoleData(): void {
    this.roleIds = [];
    const currencyData = this.commonService.getRoles();
    if (currencyData) {
      this.subscriptions.add(
        currencyData.valueChanges.subscribe(({ data }) => {
          const roleData = data.getRoles as UserRole[];
          const userRole = roleData.find(x => x.code === 'USER');
          if (userRole) {
            this.roleIds = [userRole.userRoleId ?? ''];
          } else {
            this.roleIds = [];
          }
          this.loadCustomers();
        }, (error) => {
          this.inProgress = false;
          if (this.auth.token === '') {
            this.router.navigateByUrl('/');
          }
        })
      );
    }
  }

  private loadCustomers(): void {
    this.inProgress = true;
    const listData$ = this.adminService.getUsers(
      this.roleIds,
      this.pageIndex,
      this.pageSize,
      this.sortedField,
      this.sortedDesc,
      this.filter).pipe(take(1));
    this.subscriptions.add(
      listData$.subscribe(({ list, count }) => {
        this.customers = list;
        this.customerCount = count;
        this.inProgress = false;
      }, (error) => {
        this.inProgress = false;
        if (this.auth.token === '') {
          this.router.navigateByUrl('/');
        }
      })
    );
  }

  onSaveCustomer(): void {
    this.selectedCustomer = undefined;
    if (this.detailsDialog) {
      this.detailsDialog.close();
      this.loadCustomers();
    }
  }

  sendMessage(content: any): void {
    this.messageDialog = this.modalService.open(content, {
      backdrop: 'static',
      windowClass: 'modalCusSty',
    });
  }

  sendMessageStart(data: UserMessageData): void {
    this.sendMessageInProgress = true;
    this.sendMessageError = '';
    const ids = this.customers.filter(x => x.selected === true).map(val => val.id);
    const requestData$ = this.adminService.sendAdminNotification(ids, data.level, data.title, data.text);
    this.subscriptions.add(
      requestData$.subscribe(({ result }) => {
        this.sendMessageInProgress = false;
        this.selected = false;
        this.customers.forEach(x => x.selected = false);
        if (this.messageDialog) {
          this.messageDialog.close();
        }
      }, (error) => {
        this.sendMessageInProgress = false;
        this.sendMessageError = error;
        if (this.auth.token === '') {
          this.router.navigateByUrl('/');
        }
      })
    );
  }

  export(content: any): void {
    const ids = this.customers.filter(x => x.selected === true).map(val => val.id);
    const exportData$ = this.adminService.exportUsersToCsv(
      ids,
      this.roleIds,
      this.sortedField,
      this.sortedDesc,
      this.filter);
    this.subscriptions.add(
      exportData$.subscribe(({ data }) => {
        this.modalService.open(content, {
          backdrop: 'static',
          windowClass: 'modalCusSty',
        });
      }, (error) => {
        if (this.auth.token === '') {
          this.router.navigateByUrl('/');
        }
      })
    );
  }

  handleFilterApplied(filter: Filter): void {
    this.filter = filter;
    this.loadCustomers();
  }

  handlePage(index: number): void {
    this.pageIndex = index - 1;
    this.loadCustomers();
  }

  showDetails(customer: UserItem, content: any) {
    this.selectedCustomer = customer;
    this.detailsDialog = this.modalService.open(content, {
      backdrop: 'static',
      windowClass: 'modalCusSty',
    });
  }

  showWhiteList(userId: string): void {
    this.router.navigateByUrl(`/admin/white-device-list/${userId}`);
  }
}
