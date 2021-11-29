import { Component, OnInit, OnDestroy, Output, EventEmitter } from '@angular/core';
import { AdminDataService } from '../../../services/admin-data.service';
import { FeeScheme } from '../../../../model/fee-scheme.model';
import { Subject, Subscription } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
  templateUrl: 'fee-list.component.html',
  styleUrls: ['fee-list.component.scss']
})
export class FeeListComponent implements OnInit, OnDestroy {
  @Output() changeEditMode = new EventEmitter<boolean>();
  private pShowDetails = false;
  private pEditMode = false;
  errorMessage = '';
  newSchemeIsBeingCreated = false;
  selectedScheme: FeeScheme | null = null;
  schemes: FeeScheme[] = [];
  displayedColumns: string[] = [
    'details',
    'isDefault',
    'name', 'target', 'trxType', 'instrument', 'provider'
  ];

  private destroy$ = new Subject();
  private listSubscription = Subscription.EMPTY;

  get showDetailed(): boolean {
    return this.pShowDetails;
  }

  get editMode(): boolean {
    return this.pEditMode;
  }

  constructor(
    private adminDataService: AdminDataService
  ) {
  }

  ngOnInit(): void {
    this.loadList();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
  }

  private setEditMode(mode: boolean): void {
    this.pEditMode = mode;
    this.changeEditMode.emit(mode);
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

  getDetailsIcon(schemeId: string): string {
    if (this.newSchemeIsBeingCreated) {
      return 'lock';
    } else {
      return this.isSelectedScheme(schemeId) ? 'clear' : 'open_in_new';
    }
  }

  getDetailsTooltip(schemeId: string): string {
    if (this.newSchemeIsBeingCreated) {
      return 'Save changes first';
    } else {
      return (this.isSelectedScheme(schemeId)) ? 'Hide details' : 'Change scheme';
    }
  }

  private loadList(): void {
    this.listSubscription.unsubscribe();

    this.listSubscription = this.adminDataService.getFeeSettings()
                                .pipe(
                                  takeUntil(this.destroy$)
                                )
                                .subscribe(({ list, count }) => {
                                  this.schemes = list;
                                });
  }

  private showEditor(scheme: FeeScheme | null, createNew: boolean, visible: boolean): void {
    this.pShowDetails = visible;
    if (visible) {
      this.selectedScheme = scheme;
      this.newSchemeIsBeingCreated = createNew;
      if (createNew) {
        this.setEditMode(true);
      }
    } else {
      this.selectedScheme = null;
      this.setEditMode(false);
    }
  }

  toggleDetails(scheme: FeeScheme): void {
    let show = true;
    if (this.isSelectedScheme(scheme.id)) {
      show = false;
    }
    this.showEditor(scheme, false, show);
  }

  createNewScheme(): void {
    this.showEditor(null, true, true);
  }

  onEditorFormChanged(mode: boolean): void {
    this.setEditMode(mode);
  }

  onCancelEdit(): void {
    this.newSchemeIsBeingCreated = false;
    this.showEditor(null, false, false);
    this.setEditMode(false);
  }

  onDeleteScheme(id: string): void {
    // this.editorErrorMessage = '';
    // const requestData = this.adminService.deleteFeeSettings(id);
    // if (requestData === null) {
    //   this.errorMessage = this.errorHandler.getRejectedCookieMessage();
    // } else {
    //   this.inProgress = true;
    //   requestData.subscribe(({ data }) => {
    //     this.inProgress = false;
    //     this.showEditor(null, false, false);
    //     this.refresh();
    //   }, (error) => {
    //     this.inProgress = false;
    //     if (this.auth.token !== '') {
    //       this.editorErrorMessage = this.errorHandler.getError(error.message, 'Unable to delete fee settings');
    //     } else {
    //       this.router.navigateByUrl('/');
    //     }
    //   });
    // }
  }

  onSaved(scheme: FeeScheme): void {
    // this.editorErrorMessage = '';
    // this.inProgress = true;
    // this.adminService.saveFeeSettings(scheme, this.createScheme)
    //     .subscribe(({ data }) => {
    //       this.inProgress = false;
    //       this.setEditMode(false);
    //       this.showEditor(null, false, false);
    //       this.createScheme = false;
    //       this.refresh();
    //     }, (error) => {
    //       this.inProgress = false;
    //       if (this.auth.token !== '') {
    //         this.editorErrorMessage = this.errorHandler.getError(error.message, 'Unable to save fee settings');
    //       } else {
    //         this.router.navigateByUrl('/');
    //       }
    //     });
  }
}
