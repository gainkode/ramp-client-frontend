import { DatePipe } from "@angular/common";
import { ApiKey } from "./generated-models";
import { UserItem } from "./user.model";

export class ApiKeyItem {
  title = '';
  created = '';
  user = '';
  disabled = false;

  private datepipe: DatePipe = new DatePipe('en-US');

  constructor(data: ApiKey) {
    this.title = data.apiKeyId ?? '';
    if (data.user) {
      const user = new UserItem(data.user);
      this.user = user.extendedName;
    }
    this.created = this.datepipe.transform(data.created, 'dd MMM YYYY HH:mm:ss') ?? '';
    this.disabled = data.disabled ?? false;
  }
}
