import { DatePipe } from "@angular/common";
import { ApiKey } from "./generated-models";

export class ApiKeyItem {
  title = '';
  created = '';
  user = 'User name should be here';
  disabled = false;

  private datepipe: DatePipe = new DatePipe('en-US');

  constructor(data: ApiKey) {
    this.title = data.apiKeyId ?? '';
    this.created = this.datepipe.transform(data.created, 'dd MMM YYYY HH:mm:ss') ?? '';
    this.disabled = data.disabled ?? false;
  }
}
