import { Component, OnInit, OnDestroy } from '@angular/core';
import { AdminDataService } from '../../../services/admin-data.service';
import { FeeScheme } from '../../../../model/fee-scheme.model';
import { Subject, Subscription } from 'rxjs';
import { take, takeUntil } from 'rxjs/operators';
import { LayoutService } from '../../../services/layout.service';
import { CostScheme } from 'src/app/model/cost-scheme.model';
import { PaymentInstrument, SettingsCostListResult } from 'src/app/model/generated-models';

@Component({
  templateUrl: 'fee-list.component.html',
  styleUrls: ['fee-list.component.scss']
})
export class FeeListComponent implements OnInit, OnDestroy {
  selectedScheme: FeeScheme | null = null;
  schemes: FeeScheme[] = [];
  costSchemes: CostScheme[] = [];
  displayedColumns: string[] = [
    'details',
    'isDefault',
    'name', 'target', 'trxType', 'instrument', 'provider'
  ];

  private destroy$ = new Subject();
  private subscriptions: Subscription = new Subscription();

  constructor(
    private layoutService: LayoutService,
    private adminDataService: AdminDataService
  ) {
  }

  ngOnInit(): void {
    this.layoutService.rightPanelCloseRequested$.pipe(takeUntil(this.destroy$)).subscribe(() => {
      // TODO: ask for confirmation
      this.selectedScheme = null;
    });
    if (this.costSchemes.length > 0) {
      this.loadList();
    } else {
      this.loadCostSchemeList();
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.subscriptions.unsubscribe();
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
    const listData$ = this.adminDataService.getFeeSettings().pipe(take(1));
    this.subscriptions.add(
      listData$.subscribe(({ list, count }) => {
        this.schemes = list;
        list.forEach(val => {
          if (val.instrument.length > 0 && val.provider.length > 0) {
            const instrumentData = val.instrument[0];
            const providerData = val.provider[0];
            if (instrumentData === PaymentInstrument.WireTransfer) {
              const cost = this.costSchemes.find(x => x.id === providerData);
              if (cost) {
                val.setCostSchemeName(cost.name);
              }
            }
          }
        });
      })
    );
  }

  private loadCostSchemeList(): void {
    const listData$ = this.adminDataService.getCostSettings().valueChanges.pipe(take(1));
    this.costSchemes = [];
    this.subscriptions.add(
      listData$.subscribe(({ data }) => {
        const settings = data.getSettingsCost as SettingsCostListResult;
        let itemCount = 0;
        if (settings !== null) {
          itemCount = settings?.count ?? 0;
          if (itemCount > 0) {
            this.costSchemes = settings?.list?.map((val) => new CostScheme(val)) as CostScheme[];
            this.loadList();
          }
        }
      }, (error) => {})
    );
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
    this.subscriptions.add(
      this.adminDataService.deleteFeeSettings(id)
        .subscribe(({ data }) => {
          this.selectedScheme = null;
          this.loadList();
        })
    );
  }

  onSaved(scheme: FeeScheme): void {
    this.subscriptions.add(
      this.adminDataService.saveFeeSettings(scheme)
        .subscribe(({ data }) => {
          this.selectedScheme = null;
          this.loadList();
        })
    );
  }
}
