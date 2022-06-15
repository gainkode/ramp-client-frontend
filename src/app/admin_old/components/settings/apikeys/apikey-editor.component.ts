import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { LayoutService } from '../../../services/layout.service';
import { AdminDataService } from '../../../../services/admin-data.service';
import { UserItem } from '../../../../model/user.model';
import { BehaviorSubject, Observable, of, Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged, map, switchMap, takeUntil } from 'rxjs/operators';
import { Filter } from '../../../../admin/model/filter.model';
import { UserType } from 'src/app/model/generated-models';

@Component({
  selector: 'app-apikey-editor',
  templateUrl: './apikey-editor.component.html',
  styleUrls: ['./apikey-editor.component.scss']
})
export class ApiKeyEditorComponent implements OnInit, OnDestroy {
  @Input() permission = 0;
  @Output() complete = new EventEmitter<string>();

  form = this.formBuilder.group({
    user: [undefined, { validators: [Validators.required], updateOn: 'change' }]
  });

  filteredUserOptions: Array<UserItem> = [];

  private destroy$ = new Subject();
  private userSearchString$ = new BehaviorSubject<string>('');

  constructor(
    private formBuilder: FormBuilder,
    private adminDataService: AdminDataService,
    private layoutService: LayoutService
  ) {

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
  }

  ngOnDestroy(): void {
    this.destroy$.next();
  }

  onSubmit(): void {
    if (this.form.valid) {
      const formValue = this.form.value;
      this.complete.emit(formValue.user.id);
    }
  }

  onCancel(): void {
    this.layoutService.requestRightPanelClose();
  }

  // region User input

  handleUserInputChange(event: Event): void {
    let searchString = event.target ? (event.target as HTMLInputElement).value : '';
    searchString = searchString.toLowerCase().trim();
    this.userSearchString$.next(searchString);
  }

  formatUserValue(user: UserItem): string {
    return user ?
      (user.fullName + (user.email ? ' (' + user.email + ')' : '')) : '';
  }

  // endregion

  private getUserFilteredOptions(searchString: string): Observable<UserItem[]> {
    if (searchString) {
      return this.adminDataService.findUsers(new Filter({
        accountTypes: [UserType.Merchant],
        search: searchString })).pipe(
        map(result => { return result.list; })
      );
    } else {
      return of([]);
    }
  }
}
