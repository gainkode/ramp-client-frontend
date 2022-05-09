import { AfterViewInit, Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { MatSort } from '@angular/material/sort';
import { Router } from '@angular/router';
import { NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { Subscription } from 'rxjs';
import { take } from 'rxjs/operators';
import { Filter } from 'src/app/admin_old/model/filter.model';
import { AdminDataService } from 'src/app/admin_old/services/admin-data.service';
import { UserRole } from 'src/app/model/generated-models';
import { CurrencyView } from 'src/app/model/payment.model';
import { UserItem } from 'src/app/model/user.model';
import { AuthService } from 'src/app/services/auth.service';
import { CommonDataService } from 'src/app/services/common-data.service';
import { UserMessageData } from '../send-message/send-message.component';

@Component({
  selector: 'app-admin-system-users',
  templateUrl: 'system.component.html',
  styleUrls: ['system.component.scss']
})
export class AdminSystemUsersComponent implements OnInit, OnDestroy, AfterViewInit {
  @ViewChild(MatSort) sort!: MatSort;

  filterFields = [
    'users',
    'accountType',
    'accountStatus',
    'country',
    'registrationDate',
    'search'
  ];
  displayedColumns: string[] = [
    'details',
    'referralCode',
    'firstName',
    'lastName',
    'email', 
    'role',
    'accountStatus',
    'lastLogin',
    'created'
  ];
  sendMessageInProgress = false;
  sendMessageError = '';
  inProgress = false;
  permission = 0;
  setRoleFlag = false;
  selectedUser?: UserItem;
  roleUser?: UserItem;
  roleIds: string[] = [];
  userRoles: UserRole[] = [];
  selected = false;
  users: UserItem[] = [];
  userCount = 0;
  pageSize = 50;
  pageIndex = 0;
  sortedField = 'created';
  sortedDesc = true;
  filter = new Filter({});

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
    this.permission = this.auth.isPermittedObjectCode('SYSTEM_USERS');
  }

  ngOnInit(): void {
    this.loadRoleData();
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  ngAfterViewInit() {
    this.subscriptions.add(
      this.sort.sortChange.subscribe(() => {
        this.sortedDesc = (this.sort.direction === 'desc');
        this.sortedField = this.sort.active;
        this.loadUsers();
      })
    );
  }

  onUserSelected(item: UserItem): void {
    item.selected = !item.selected;
    this.selected = this.users.some(x => x.selected === true);
  }

  handleFilterApplied(filter: Filter): void {
    this.filter = filter;
    this.loadUsers();
  }

  handlePage(index: number): void {
    this.pageIndex = index - 1;
    this.loadUsers();
  }

  setUserRole(item: UserItem): void {
    this.roleUser = item;
    this.setRoleFlag = true;
  }

  addUser(content: any): void {
    
  }
  
  setRole(): void {
    this.setRoleFlag = true;
  }

  showTransactions(id: string): void {
    this.router.navigateByUrl(`/admin/transactions/users/${id}`);
  }

  showWallets(id: string): void {
    this.router.navigateByUrl(`/admin/crypto-wallets/users/${id}`);
  }

  private loadRoleData(): void {
    this.roleIds = [];
    const currencyData = this.commonService.getRoles();
    if (currencyData) {
      this.subscriptions.add(
        currencyData.valueChanges.subscribe(({ data }) => {
          this.userRoles = data.getRoles as UserRole[];
          const filteredRoles = this.userRoles.filter(x => x.code !== 'USER');
          if (filteredRoles) {
            this.roleIds = filteredRoles.map(val => val.userRoleId ?? '');
          } else {
            this.roleIds = [];
          }
          this.loadUsers();
        }, (error) => {
          this.inProgress = false;
          if (this.auth.token === '') {
            this.router.navigateByUrl('/');
          }
        })
      );
    }
  }

  private loadUsers(): void {
    this.inProgress = true;
    const listData$ = this.adminService.getSystemUsers(
      this.roleIds,
      this.pageIndex,
      this.pageSize,
      this.sortedField,
      this.sortedDesc,
      this.filter).pipe(take(1));
    this.subscriptions.add(
      listData$.subscribe(({ list, count }) => {
        this.users = list;
        this.userCount = count;
        this.inProgress = false;
      }, (error) => {
        this.inProgress = false;
        if (this.auth.token === '') {
          this.router.navigateByUrl('/');
        }
      })
    );
  }

  onSaveUser(): void {
    this.selectedUser = undefined;
    if (this.detailsDialog) {
      this.detailsDialog.close();
      this.loadUsers();
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
    const ids = this.users.filter(x => x.selected === true).map(val => val.id);
    const requestData$ = this.adminService.sendAdminNotification(ids, data.level, data.title, data.text);
    this.subscriptions.add(
      requestData$.subscribe(({ result }) => {
        this.sendMessageInProgress = false;
        this.selected = false;
        this.users.forEach(x => x.selected = false);
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
    const ids = this.users.filter(x => x.selected === true).map(val => val.id);
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

  showDetails(user: UserItem, content: any) {
    this.selectedUser = user;
    this.detailsDialog = this.modalService.open(content, {
      backdrop: 'static',
      windowClass: 'modalCusSty',
    });
  }
}
