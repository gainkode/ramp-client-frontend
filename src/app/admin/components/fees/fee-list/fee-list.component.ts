import { Component, OnInit, OnDestroy } from '@angular/core';
import { AdminDataService } from '../../../services/admin-data.service';
import { FeeScheme } from '../../../../model/fee-scheme.model';
import { pipe, Subject, Subscription } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { LayoutService } from '../../../services/layout.service';

@Component({
  templateUrl: 'fee-list.component.html',
  styleUrls: ['fee-list.component.scss']
})
export class FeeListComponent implements OnInit, OnDestroy {
  selectedScheme: FeeScheme | null = null;
  schemes: FeeScheme[] = [];
  displayedColumns: string[] = [
    'details',
    'isDefault',
    'name', 'target', 'trxType', 'instrument', 'provider'
  ];

  private destroy$ = new Subject();
  private listSubscription = Subscription.EMPTY;

  constructor(
    private layoutService: LayoutService,
    private adminDataService: AdminDataService
  ) {
  }

  ngOnInit(): void {
    this.layoutService.rightPanelCloseRequested$.pipe(takeUntil(this.destroy$))
        .subscribe(() => {
          // TODO: ask for confirmation
          this.selectedScheme = null;
        });

    this.loadList();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
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
    if (this.selectedScheme && !this.selectedScheme.id) {
      return 'lock';
    } else {
      return this.isSelectedScheme(schemeId) ? 'clear' : 'open_in_new';
    }
  }

  getDetailsTooltip(schemeId: string): string {
    if (this.selectedScheme && !this.selectedScheme.id) {
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

  toggleDetails(scheme: FeeScheme): void {
    if (this.isSelectedScheme(scheme.id)) {
      this.selectedScheme = null;
    } else {
      this.selectedScheme = scheme;
    }
  }

  createNewScheme(): void {
    this.selectedScheme = new FeeScheme(null);
  }

  onCancelEdit(): void {
    this.selectedScheme = null;
  }

  onDeleteScheme(id: string): void {
    this.adminDataService.deleteFeeSettings(id)
        .subscribe(({ data }) => {
          this.selectedScheme = null;
          this.loadList();
        });
  }

  onSaved(scheme: FeeScheme): void {
    this.adminDataService.saveFeeSettings(scheme)
        .subscribe(({ data }) => {
          this.selectedScheme = null;
          this.loadList();
        });
  }
}
