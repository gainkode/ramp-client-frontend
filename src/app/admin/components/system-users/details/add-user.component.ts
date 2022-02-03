import { AfterViewInit, Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { FormBuilder, FormControl, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable, of, Subject, Subscription } from 'rxjs';
import { debounceTime, distinctUntilChanged, map, switchMap, take, takeUntil } from 'rxjs/operators';
import { Filter } from 'src/app/admin/model/filter.model';
import { AdminDataService } from 'src/app/admin/services/admin-data.service';
import { LayoutService } from 'src/app/admin/services/layout.service';
import { CommonDialogBox } from 'src/app/components/dialogs/common-box.dialog';
import { CommonTargetValue } from 'src/app/model/common.model';
import { Countries, getCountryByCode3 } from 'src/app/model/country-code.model';
import { AccountStatus, RiskLevel, UserInput, UserRole, UserType } from 'src/app/model/generated-models';
import { CurrencyView, RiskLevelViewList, UserStatusList } from 'src/app/model/payment.model';
import { RoleItem, UserItem } from 'src/app/model/user.model';
import { AuthService } from 'src/app/services/auth.service';
import { getFormattedUtcDate } from 'src/app/utils/utils';

@Component({
  selector: 'app-add-system-user',
  templateUrl: 'add-user.component.html',
  styleUrls: ['add-user.component.scss']
})
export class AddSystemUserComponent implements OnInit, OnDestroy, AfterViewInit {
  @Input() set roles(list: UserRole[]) {
    this.roleList = list.map(val => {
      this.dataForm.addControl(
        val.code,
        new FormControl(false));
      return new RoleItem(val);
    });
  }
  @Output() save = new EventEmitter();
  @Output() cancel = new EventEmitter();

  errorMessage = '';
  validUser = false;

  dataForm = this.formBuilder.group({
    userId: ['', { validators: [Validators.required], updateOn: 'change' }]
  });

  filteredUserOptions: Array<UserItem> = [];
  roleList: RoleItem[] = [];

  private destroy$ = new Subject();
  private subscriptions: Subscription = new Subscription();
  private userSearchString$ = new BehaviorSubject<string>('');
  private selectedRoles: string[] = [];

  constructor(
    private formBuilder: FormBuilder,
    private layoutService: LayoutService,
    private router: Router,
    public dialog: MatDialog,
    private auth: AuthService,
    private adminService: AdminDataService) {
  }

  ngOnInit(): void {
    this.userSearchString$.pipe(
      takeUntil(this.destroy$),
      distinctUntilChanged(),
      debounceTime(1000),
      switchMap(searchString => this.getUserFilteredOptions(searchString))
    ).subscribe(options => {
      this.filteredUserOptions = options;
    });
    this.subscriptions.add(
      this.dataForm.controls.userId.valueChanges.subscribe(val => {
        this.validUser = false;
        this.selectedRoles = [];
        if (val instanceof UserItem) {
          this.validUser = true;
          this.roleList.forEach(role => {
            this.dataForm.get(role.code)?.setValue(false);
          });
          val.roles.forEach(code => {
            this.selectedRoles = [...this.selectedRoles, code];
            this.dataForm.get(code)?.setValue(true);
          });
        }
      })
    );
  }

  ngAfterViewInit(): void {
    this.layoutService.setBackdrop(true);
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.subscriptions.unsubscribe();
  }

  handleUserInputChange(event: Event): void {
    let searchString = event.target ? (event.target as HTMLInputElement).value : '';
    searchString = searchString.toLowerCase().trim();
    this.userSearchString$.next(searchString);
  }

  formatUserValue(user: UserItem): string {
    return user ?
      (user.fullName + (user.email ? ' (' + user.email + ')' : '')) : '';
  }

  private getUserFilteredOptions(searchString: string): Observable<UserItem[]> {
    if (searchString) {
      return this.adminService.findUsers(
        new Filter({ search: searchString })).pipe(map(result => {
          return result.list;
        }));
    } else {
      return of([]);
    }
  }

  private onSave(userId: string, assigned: string[], removed: string[]): void {
    if (assigned.length > 0) {
      const requestData$ = this.adminService.assignRole(userId, assigned);
      this.subscriptions.add(
        requestData$.subscribe(({ data }) => {
          this.removeUserRole(userId, removed);
        }, (error) => {
          if (this.auth.token === '') {
            this.router.navigateByUrl('/');
          }
        })
      );
    } else {
      this.removeUserRole(userId, removed);
    }
  }

  private removeUserRole(userId: string, roles: string[]): void {
    const requestData$ = this.adminService.removeRole(userId, roles);
    this.subscriptions.add(
      requestData$.subscribe(({ data }) => {
        this.save.emit();
      }, (error) => {
        if (this.auth.token === '') {
          this.router.navigateByUrl('/');
        }
      })
    );
  }

  private getAssignedRoles(current: string[], state: string[]): string[] {
    let result: string[] = [];
    current.forEach(x => {
      if (!state.includes(x)) {
        result = [...result, x];
      }
    });
    return result;
  }

  private getRemovedRoles(current: string[], state: string[]): string[] {
    let result: string[] = [];
    state.forEach(x => {
      if (!current.includes(x)) {
        result = [...result, x];
      }
    });
    return result;
  }

  onSubmit(): void {
    if (this.validUser) {
      let selection: string[] = [];
      this.roleList.forEach(role => {
        if (this.dataForm.get(role.code)?.value === true) {
          selection = [...selection, role.code];
        }
      });
      if (selection.length > 0) {
        this.onSave(
          (this.dataForm.controls.userId.value as UserItem).id,
          this.getAssignedRoles(selection, this.selectedRoles),
          this.getRemovedRoles(selection, this.selectedRoles));
      } else {
        this.errorMessage = 'Select at least one role for the user.';
      }
    } else {
      this.errorMessage = 'Valid user is not selected.';
    }
  }

  onCancel(): void {
    this.cancel.emit();
  }
}
