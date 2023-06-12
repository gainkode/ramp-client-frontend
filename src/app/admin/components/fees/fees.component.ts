import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { Subscription } from 'rxjs';
import { take } from 'rxjs/operators';
import { AdminDataService } from 'services/admin-data.service';
import { CostScheme } from 'model/cost-scheme.model';
import { FeeScheme } from 'model/fee-scheme.model';
import { PaymentInstrument, SettingsCostListResult } from 'model/generated-models';
import { AuthService } from 'services/auth.service';

@Component({
  selector: 'app-admin-fee-schemes',
  templateUrl: 'fees.component.html',
  styleUrls: ['fees.component.scss']
})
export class AdminFeeSchemesComponent implements OnInit, OnDestroy {
  displayedColumns: string[] = [
    'details',
    'default',
    'name',
    'target',
    'trxType',
    'instrument',
    'provider'
  ];
  inProgress = false;
  errorMessage = '';
  detailsTitle = '';
  permission = 0;
  selectedScheme?: FeeScheme;
  schemes: FeeScheme[] = [];
  costs: CostScheme[] = [];

  private subscriptions: Subscription = new Subscription();
  private detailsDialog: NgbModalRef | undefined = undefined;

  constructor(
    private modalService: NgbModal,
    private auth: AuthService,
    private adminService: AdminDataService,
    private router: Router
  ) {
    this.permission = this.auth.isPermittedObjectCode('FEES');
  }

  ngOnInit(): void {
    this.loadSchemes();
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  private loadSchemes(): void {
    this.loadCostSchemes();
  }

  private loadCostSchemes(): void {
    this.schemes = [];
    this.inProgress = true;
    const listData$ = this.adminService.getCostSettings().valueChanges.pipe(take(1));
    this.subscriptions.add(
      listData$.subscribe(({ data }) => {
        this.inProgress = false;
        const settings = data.getSettingsCost as SettingsCostListResult;
        let itemCount = 0;
        if (settings !== null) {
          itemCount = settings?.count ?? 0;
          if (itemCount > 0) {
            this.costs = settings?.list?.map((val) => new CostScheme(val)) as CostScheme[];
            this.loadFeeSchemes();
          }
        }
      })
    );
  }

  private loadFeeSchemes(): void {
    this.schemes = [];
    this.inProgress = true;
    const listData$ = this.adminService.getFeeSettings().pipe(take(1));
    this.subscriptions.add(
      listData$.subscribe(({ list, count }) => {
        this.inProgress = false;
        this.schemes = list;
        list.forEach(val => {
          if (val.instrument.length > 0 && val.provider.length > 0) {
            const instrumentData = val.instrument[0];
            const providerData = val.provider[0];
            if (instrumentData === PaymentInstrument.WireTransfer) {
              const cost = this.costs.find(x => x.id === providerData);
              if (cost) {
                val.setCostSchemeName(cost.name);
              }
            }
          }
        });
      })
    );
  }

  showDetails(scheme: FeeScheme | undefined, content: any): void {
    this.selectedScheme = scheme;
    if (scheme) {
      this.detailsTitle = 'Fee scheme details';
    } else {
      this.detailsTitle = 'Add new fee scheme';
    }
    this.detailsDialog = this.modalService.open(content, {
      backdrop: 'static',
      windowClass: 'modalCusSty',
    });
    this.subscriptions.add(
      this.detailsDialog.closed.subscribe(val => {
        this.loadSchemes();
      })
    );
  }
}
