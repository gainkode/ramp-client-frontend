import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { UntypedFormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { concat, Observable, of, Subject, Subscription } from 'rxjs';
import { debounceTime, distinctUntilChanged, filter, map, switchMap, tap } from 'rxjs/operators';
import { Filter } from 'src/app/admin/model/filter.model';
import { AdminDataService } from 'src/app/services/admin-data.service';
import { ApiKeyItem } from 'src/app/model/apikey.model';
import { ApiKeySecret, UserType } from 'src/app/model/generated-models';
import { UserItem } from 'src/app/model/user.model';
import { AuthService } from 'src/app/services/auth.service';

@Component({
  selector: 'app-admin-apikey-details',
  templateUrl: 'apikey-details.component.html',
  styleUrls: ['apikey-details.component.scss', '../../../assets/scss/_validation.scss']
})
export class AdminApiKeyDetailsComponent implements OnInit, OnDestroy {
  @Input() permission = 0;

  @Output() save = new EventEmitter<string>();
  @Output() close = new EventEmitter();

  private subscriptions: Subscription = new Subscription();

  submitted = false;
  saveInProgress = false;
  errorMessage = '';
  isUsersLoading = false;
  usersSearchInput$ = new Subject<string>();
  usersOptions$: Observable<UserItem[]> = of([]);
  minUsersLengthTerm = 1;

  form = this.formBuilder.group({
    user: [null, { validators: [Validators.required], updateOn: 'change' }]
  });

  constructor(
    private formBuilder: UntypedFormBuilder,
    private router: Router,
    private auth: AuthService,
    private adminService: AdminDataService) {

  }

  ngOnInit(): void {
    this.initUserSearch();
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  private initUserSearch() {
    this.usersOptions$ = concat(
      of([]),
      this.usersSearchInput$.pipe(
        filter(res => {
          return res !== null && res.length >= this.minUsersLengthTerm
        }),
        debounceTime(300),
        distinctUntilChanged(),
        tap(() => {
          this.isUsersLoading = true;
        }),
        switchMap(searchString => {
          this.isUsersLoading = false;
          return this.adminService.findUsers(new Filter(
            {
              search: searchString,
              accountTypes: [UserType.Merchant]
            }))
            .pipe(map(result => result.list));
        })
      ));
  }

  private getApiKeyItem(): ApiKeyItem {
    const widget = new ApiKeyItem({
      userId: '',
      created: new Date(),
      apiKeyId: ''
    });
    const formValue = this.form.value;
    widget.user = formValue.user.id;
    return widget;
  }

  onSubmit(): void {
    this.submitted = true;
    if (this.form.valid) {
      this.onSave();
    }
  }

  private onSave(): void {
    this.saveInProgress = true;
    const keyItem = this.getApiKeyItem();
    const requestData$ = this.adminService.createApiKey(keyItem.user);
    this.subscriptions.add(
      requestData$.subscribe(({ data }) => {
        this.saveInProgress = false;
        const apiKeyData = data.createUserApiKey as ApiKeySecret;
        this.save.emit(`${apiKeyData.apiKeyId}|${apiKeyData.secret}`);
      }, (error) => {
        this.saveInProgress = false;
        this.errorMessage = error;
        if (this.auth.token === '') {
          this.router.navigateByUrl('/');
        }
      })
    );
  }
}
