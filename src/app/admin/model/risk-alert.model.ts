import { RiskAlert } from '../../model/generated-models';
import { DatePipe } from '@angular/common';
import { UserItem } from 'model/user.model';

export class RiskAlertItem {
  created = '';
  details = '';
  riskAlertId?: string;
  riskAlertType = '';
  entity = '';
  userId?: string;
  user: UserItem | undefined = undefined;

  constructor(data: RiskAlert | null) {
    if (data) {
      const datepipe: DatePipe = new DatePipe('en-US');
      this.created = (data.created) ? datepipe.transform(data.created, 'dd MMM YYYY HH:mm:ss') as string : '';
      this.riskAlertId = data.riskAlertId as string;
      this.riskAlertType = data.riskAlertTypeCode ?? '';
      this.details = data.details ?? '{}';
      if (data.details === null) {
        this.details = '{}';
      }
      const detailsData = JSON.parse(this.details);
      if (detailsData.riskAlertTypeCode) {
        this.riskAlertType = detailsData.riskAlertTypeCode;
      }
      if (detailsData.entity) {
        this.entity = detailsData.entity;
      }
      this.userId = data.userId;
      if (data.user) {
        this.user = new UserItem(data.user);
      }
    }
  }
}
