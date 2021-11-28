import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { DashboardService } from '../dashboard.service';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
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

  private destroy$ = new Subject();

  constructor(
    private dashboardService: DashboardService
  ) {

  }

  ngOnInit(): void {
    this.dashboardService.data
        .pipe(
          takeUntil(this.destroy$)
        )
        .subscribe(data => {
          this.data = data[this.source];
        });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
  }

}
