import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { TransactionItemFull } from '../../../../model/transaction.model';
import { ErrorService } from '../../../../services/error.service';
import { AdminDataService } from '../../../../services/admin-data.service';
import { take } from 'rxjs/operators';
import { Subscription } from 'rxjs';
import { CurrencyView } from 'src/app/model/payment.model';
import { CommonDataService } from 'src/app/services/common-data.service';
import { SettingsCurrencyWithDefaults } from 'src/app/model/generated-models';
import { AuthService } from 'src/app/services/auth.service';

@Component({
  selector: 'app-transaction-single',
  templateUrl: './transaction-single.component.html',
  styleUrls: ['./transaction-single.component.scss']
})
export class TransactionSingleComponent implements OnInit, OnDestroy {
  transactionId?: string;
  transaction?: TransactionItemFull;
  currencyOptions: CurrencyView[] = [];

  private subscriptions: Subscription = new Subscription();

  constructor(
    private auth: AuthService,
    private activeRoute: ActivatedRoute,
    private commonDataService: CommonDataService,
    private adminService: AdminDataService,
    private router: Router
  ) {
  }

  ngOnInit(): void {
    this.subscriptions.add(
      this.activeRoute.params.subscribe(routeParams => {
        this.loadData(routeParams.id);
      })
    );
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  private loadData(id: string): void {
    this.transactionId = id;
    this.currencyOptions = [];
    const transactionData$ = this.commonDataService.getSettingsCurrency()?.valueChanges;
    this.subscriptions.add(
      transactionData$.subscribe(({ data }) => {
        const currencySettings = data.getSettingsCurrency as SettingsCurrencyWithDefaults;
        if (currencySettings.settingsCurrency && (currencySettings.settingsCurrency.count ?? 0 > 0)) {
          this.currencyOptions = currencySettings.settingsCurrency.list?.map((val) => new CurrencyView(val)) as CurrencyView[];
        } else {
          this.currencyOptions = [];
        }
        this.subscriptions.add(
          this.adminService.getTransaction(id).pipe(take(1)).subscribe(transaction => {
            this.transaction = transaction;
          })
        );
      }, (error) => {
        if (this.auth.token === '') {
          this.router.navigateByUrl('/');
        }
      })
    );
  }
}
