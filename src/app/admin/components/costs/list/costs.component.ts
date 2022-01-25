import { Component, OnInit, OnDestroy, Output, EventEmitter, Input } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../../../services/auth.service';
import { AdminDataService } from '../../../services/admin-data.service';
import { ErrorService } from '../../../../services/error.service';
import { CostScheme } from '../../../../model/cost-scheme.model';
import { Subject, Subscription } from 'rxjs';
import { LayoutService } from '../../../services/layout.service';
import { take, takeUntil } from 'rxjs/operators';

@Component({
  templateUrl: 'costs.component.html',
  styleUrls: ['costs.component.scss'],
  selector: 'app-cost-table'
})
export class CostsComponent implements OnInit, OnDestroy {
  @Input() selectedScheme: CostScheme | null = null;
  @Input() schemes: CostScheme[] = [];
  @Output() toggle = new EventEmitter<CostScheme>();

  private pShowDetails = false;
  private pEditMode = false;
  
  inProgress = false;
  errorMessage = '';
  editorErrorMessage = '';
  createScheme = false;
  displayedColumns: string[] = [
    'details', 'isDefault', 'name', 'target', 'trxType', 'instrument', 'provider'
  ];

  get showDetailed(): boolean {
    return this.pShowDetails;
  }

  get editMode(): boolean {
    return this.pEditMode;
  }

  private destroy$ = new Subject();
  private subscriptions: Subscription = new Subscription();

  constructor(
    private layoutService: LayoutService,
    private auth: AuthService,
    private errorHandler: ErrorService,
    private adminService: AdminDataService,
    private router: Router) {
  }

  ngOnInit(): void {
    this.layoutService.rightPanelCloseRequested$.pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        this.selectedScheme = null;
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.subscriptions.unsubscribe();
  }

  refresh(): void {
    const settingsData = this.adminService.getCostSettings();
    if (settingsData !== null) {
      settingsData.refetch();
    }
  }

  private setEditMode(mode: boolean): void {
    this.pEditMode = mode;
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
    if (this.createScheme) {
      return 'lock';
    } else {
      return (this.isSelectedScheme(schemeId)) ? 'clear' : 'open_in_new';
    }
  }

  getDetailsTooltip(schemeId: string): string {
    if (this.createScheme) {
      return 'Save changes first';
    } else {
      return (this.isSelectedScheme(schemeId)) ? 'Hide details' : 'Change scheme';
    }
  }

  private showEditor(scheme: CostScheme | null, createNew: boolean, visible: boolean): void {
    this.pShowDetails = visible;
    if (visible) {
      this.selectedScheme = scheme;
      this.createScheme = createNew;
      if (createNew) {
        this.setEditMode(true);
      }
    } else {
      this.selectedScheme = null;
      this.setEditMode(false);
    }
  }

  toggleDetails(scheme: CostScheme): void {
    this.toggle.emit(scheme);
  }

  onDeleteScheme(id: string): void {
    this.editorErrorMessage = '';
    const requestData$ = this.adminService.deleteCostSettings(id);
    this.inProgress = true;
    this.subscriptions.add(
      requestData$.subscribe(({ data }) => {
        this.inProgress = false;
        this.showEditor(null, false, false);
        this.refresh();
      }, (error) => {
        this.inProgress = false;
        if (this.auth.token !== '') {
          this.editorErrorMessage = this.errorHandler.getError(error.message, 'Unable to delete cost settings');
        } else {
          this.router.navigateByUrl('/');
        }
      })
    );
  }

  onSaved(scheme: CostScheme): void {
    this.editorErrorMessage = '';
    this.inProgress = true;
    const requestData$ = this.adminService.saveCostSettings(scheme, this.createScheme)
    this.subscriptions.add(
      requestData$.subscribe(({ data }) => {
        this.inProgress = false;
        this.setEditMode(false);
        this.showEditor(null, false, false);
        this.createScheme = false;
        this.refresh();
      }, (error) => {
        this.inProgress = false;
        if (this.auth.token !== '') {
          this.editorErrorMessage = this.errorHandler.getError(error.message, 'Unable to save cost settings');
        } else {
          this.router.navigateByUrl('/');
        }
      })
    );
  }
}
