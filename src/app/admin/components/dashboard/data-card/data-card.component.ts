import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { DashboardService } from '../dashboard.service';
import { Subscription } from 'rxjs';
import { take } from 'rxjs/operators';
import { DashboardCardData } from '../../../model/dashboard-data.model';

@Component({
  selector: 'app-data-card',
  templateUrl: './data-card.component.html',
  styleUrls: ['./data-card.component.scss']
})
export class DataCardComponent implements OnInit, OnDestroy {

  @Input()
  title = '';

  @Input()
  source = '';

  data?: DashboardCardData;

  private subscriptions: Subscription = new Subscription();

  constructor(
    private dashboardService: DashboardService
  ) {

  }

  ngOnInit(): void {
    this.subscriptions.add(
      this.dashboardService.data.pipe(take(1)).subscribe(data => {
        this.data = data[this.source];
      })
    );
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }
}
