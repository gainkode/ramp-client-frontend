import { Component, EventEmitter, Input, Output } from '@angular/core';
import { AbstractControl, UntypedFormBuilder, FormGroup, Validators } from '@angular/forms';
import { CommonTargetValue } from 'src/app/model/common.model';
import { UserNotificationLevel } from 'src/app/model/generated-models';
import { concat, Observable, of, Subject, Subscription } from 'rxjs';
import { UserItem } from 'src/app/model/user.model';
import { debounceTime, distinctUntilChanged, filter, map, switchMap, take, tap } from 'rxjs/operators';
import { AdminDataService } from 'src/app/services/admin-data.service';
import { Filter } from 'src/app/admin/model/filter.model';

export class UserMessageData {
  level: UserNotificationLevel = UserNotificationLevel.Info;
  title = '';
  text = '';
}

@Component({
  selector: 'app-admin-user-message-dialog',
  templateUrl: 'send-message.component.html',
  styleUrls: ['send-message.component.scss', '../../../assets/scss/_validation.scss']
})
export class AdminMessageDialogComponent {
  @Input() errorMessage = '';
  @Input() inProgress = false;
  @Input() set users(val: UserItem[] | undefined) {
    if(val){
      this.usersPreset = val.filter(x => x.selected === true).map(x => {
        return {
            id: x.id,
            title: (x.fullName !== '') ? `${x.fullName} (${x.email})` : x.email
          } as CommonTargetValue;
        }
      );
      this.messageForm.get('users')?.setValue(this.usersPreset.map(x => {
        return x.id;
      }))
    }
  }
  @Output() send = new EventEmitter<UserMessageData>();
  @Output() close = new EventEmitter();

  submitted = false;
  usersOptions$: Observable<CommonTargetValue[]> = of([]);
  usersPreset: CommonTargetValue[] = [];
  usersSearchInput$ = new Subject<string>();
  isUsersLoading = false;
  
  messageForm = this.formBuilder.group({
    level: [UserNotificationLevel.Info, { validators: [Validators.required], updateOn: 'change' }],
    title: ['', { validators: [Validators.required], updateOn: 'change' }],
    text: ['', { validators: [Validators.required], updateOn: 'change' }],
    users: [[], {}],
  });

  get levelField(): AbstractControl | null {
    return this.messageForm.get('level');
  }

  get titleField(): AbstractControl | null {
    return this.messageForm.get('title');
  }

  get textField(): AbstractControl | null {
    return this.messageForm.get('text');
  }

  levels: CommonTargetValue[] = [
    { id: UserNotificationLevel.Request, title: 'Request', imgClass: '', imgSource: '' },
    { id: UserNotificationLevel.Debug, title: 'Debug', imgClass: '', imgSource: '' },
    { id: UserNotificationLevel.Info, title: 'Info', imgClass: '', imgSource: '' },
    { id: UserNotificationLevel.Warning, title: 'Warning', imgClass: '', imgSource: '' },
    { id: UserNotificationLevel.Error, title: 'Error', imgClass: '', imgSource: '' }
  ];

  constructor(
    private formBuilder: UntypedFormBuilder,
    private adminService: AdminDataService) { }
  
  ngOnInit(): void {
    this.usersSearch();
  }
  
  onSubmit(): void {
    this.submitted = true;
    if (this.messageForm.valid) {
      this.send.emit({
        level: this.levelField?.value ?? UserNotificationLevel.Info,
        title: this.titleField?.value ?? '',
        text: this.textField?.value ?? ''
      });
    }
  }

  onClose(): void {
    this.close.emit();
  }

  private usersSearch(): void {
    let searchItems:CommonTargetValue[] = [];
    if(this.usersPreset && this.usersPreset.length != 0){
      searchItems = this.usersPreset;
    }
    this.usersOptions$ = concat(
      of(searchItems),
      this.usersSearchInput$.pipe(
        debounceTime(300),
        distinctUntilChanged(),
        tap(() => {
          this.isUsersLoading = true;
        }),
        switchMap(searchString => {
          this.isUsersLoading = false;
          return this.adminService.getUsers(
            [],
            0,
            100,
            'email',
            false,
            new Filter({ search: searchString })
          ).pipe(map(result => {
            return result.list.map(x => {
              return {
                id: x.id,
                title: (x.fullName !== '') ? `${x.fullName} (${x.email})` : x.email
              } as CommonTargetValue;
            });
          }));
        })
      ));
  }
}
