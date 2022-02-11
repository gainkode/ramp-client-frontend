import { Component, EventEmitter, Input, OnDestroy, Output } from '@angular/core';
import { Subscription } from 'rxjs';
import { LayoutService } from 'src/app/admin/services/layout.service';
import { Router } from '@angular/router';
import { RiskAlertItem } from 'src/app/admin/model/risk-alert.model';

@Component({
  selector: 'app-risk-alert-details',
  templateUrl: 'risk-alert-details.component.html',
  styleUrls: ['risk-alert-details.component.scss']
})
export class RiskAlertDetailsComponent implements OnDestroy {
  @Input() set alert(val: RiskAlertItem | null | undefined) {
    this.data = val;
    this.layoutService.setBackdrop(!val?.riskAlertId);
  }
  @Output() cancel = new EventEmitter();

  data: RiskAlertItem | null | undefined

  private subscriptions: Subscription = new Subscription();

  constructor(
    private layoutService: LayoutService,
    private router: Router) {
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  onCancel(): void {
    this.cancel.emit();
  }
}
