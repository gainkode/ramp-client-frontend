import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router} from '@angular/router';
import { ErrorService } from '../../../../services/error.service';
import { AdminDataService } from '../../../services/admin-data.service';
import { take } from 'rxjs/operators';
import { Subscription } from 'rxjs';
import { UserItem } from 'src/app/model/user.model';
import { CurrencyView } from 'src/app/model/payment.model';
import { CommonDataService } from 'src/app/services/common-data.service';
import { SettingsCurrencyWithDefaults } from 'src/app/model/generated-models';
import { AuthService } from 'src/app/services/auth.service';

@Component({
  selector: 'app-customer-single',
  templateUrl: './customer-single.component.html',
  styleUrls: ['./customer-single.component.scss']
})
export class CustomerSingleComponent implements OnInit, OnDestroy {
  customerId?: string;
  customer?: UserItem;
  currencyOptions: CurrencyView[] = [];

  private subscriptions: Subscription = new Subscription();

  constructor(
    private activeRoute: ActivatedRoute,
    private router: Router,
    private errorHandler: ErrorService,
    private auth: AuthService,
    private commonDataService: CommonDataService,
    private adminService: AdminDataService
  ) {
  }

  ngOnInit(): void {
    this.activeRoute.params.subscribe(routeParams => {
      this.loadData(routeParams.id);
    });
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  private loadData(id: string): void {
    this.customerId = id;
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
        this.adminService.getUser(id).pipe(take(1)).subscribe(user => {
          this.customer = user;
        });
      }, (error) => {
        if (this.auth.token === '') {
          this.router.navigateByUrl('/');
        }
      })
    );
  }
}
