import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { take } from 'rxjs/operators';
import { DashboardCardData } from '../../model/dashboard-data.model';
import { DashboardService } from '../../services/dashboard.service';

@Component({
  selector: 'app-admin-dashboard-card',
  templateUrl: './dashboard-card.component.html',
  styleUrls: ['./dashboard-card.component.scss']
})
export class AdminDashboardCardComponent implements OnInit, OnDestroy {
  @Input() title = '';
  @Input() source = '';

  data?: DashboardCardData;

  private subscriptions: Subscription = new Subscription();

  constructor(private dashboardService: DashboardService) {}

  ngOnInit(): void {
    this.subscriptions.add(
      this.dashboardService.data.subscribe(data => {
        console.log('item', this.source, data);
        this.data = data[this.source];
      })
    );
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }
}
