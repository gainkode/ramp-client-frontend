import { RiskAlert, RiskAlertCodes} from '../../model/generated-models';
import { DatePipe } from '@angular/common';
import { RiskAlertCodeList } from './lists.model';

export class RiskAlertItem {
  created?: string;
  details?: string;
  riskAlertId?: string;
  riskAlertType?: string;
  userId?: string;

  constructor(data: RiskAlert | null) {
    if (data) {
      const datepipe: DatePipe = new DatePipe('en-US');

      this.created = (data.created) ? datepipe.transform(data.created, 'dd MMM YYYY HH:mm:ss') as string : '';
      this.details = data.details as string;
      this.riskAlertId = data.riskAlertId as string;
      this.riskAlertType = data.riskAlertTypeCode ?
        RiskAlertCodeList.find(c => c.id === data.riskAlertTypeCode)?.name :
        undefined;
      this.userId = data.userId;
    }
  }
}
