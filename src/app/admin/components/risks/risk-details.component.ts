import { Component, EventEmitter, Input, Output } from '@angular/core';
import { RiskAlertItem } from 'admin/model/risk-alert.model';

@Component({
  selector: 'app-admin-risk-details',
  templateUrl: 'risk-details.component.html',
  styleUrls: ['risk-details.component.scss', '../../assets/scss/_validation.scss']
})
export class AdminRiskDetailsComponent {
  @Input() permission = 0;
  @Input() set alert(val: RiskAlertItem | null | undefined) {
    this.data = val;
    const details = this.data?.details ?? '{}';
    const detailsData = JSON.parse(details);
    this.detailsInfo = this.getObjectValues(detailsData, 0);
  }
  @Output() close = new EventEmitter();

  data: RiskAlertItem | null | undefined
  detailsInfo: string[] = [];

  constructor() { }

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

  onClose(): void {
    this.close.emit();
  }
}
