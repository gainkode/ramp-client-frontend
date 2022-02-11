import { Component, EventEmitter, Input, OnDestroy, Output } from '@angular/core';
import { Subscription } from 'rxjs';
import { LayoutService } from 'src/app/admin/services/layout.service';
import { RiskAlertItem } from 'src/app/admin/model/risk-alert.model';

@Component({
  selector: 'app-risk-alert-details',
  templateUrl: 'risk-alert-details.component.html',
  styleUrls: ['risk-alert-details.component.scss']
})
export class RiskAlertDetailsComponent implements OnDestroy {
  @Input() set alert(val: RiskAlertItem | null | undefined) {
    this.data = val;
    const details = this.data?.details ?? '{}';
    const detailsData = JSON.parse(details);
    this.detailsInfo = this.getObjectValues(detailsData, 0);
    this.layoutService.setBackdrop(!val?.riskAlertId);
  }
  @Output() cancel = new EventEmitter();

  data: RiskAlertItem | null | undefined
  detailsInfo: string[] = [];

  private subscriptions: Subscription = new Subscription();

  constructor(
    private layoutService: LayoutService) {
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  onCancel(): void {
    this.cancel.emit();
  }

  private getObjectValues(data: any, level: number): string[] {
    const result: string[] = [];
    for (let key in data) {
      const blockKey = (level == 0 && (key === 'riskAlertTypeCode' || key === 'entity'));
      if (!blockKey) {
        let value = data[key];
        if (typeof value === 'object') {
          const sub = this.getObjectValues(value, level + 1);
          sub.forEach(val => {
            result.push(`${key}.${val}`);
          });
        } else {
          result.push(`${key}: ${value}`);
        }
      }
    }
    return result;
  }
}
