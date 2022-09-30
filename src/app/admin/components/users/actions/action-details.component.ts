import { Component, EventEmitter, Input, Output } from '@angular/core';
import { UserActionItem } from 'src/app/model/user.model';

@Component({
  selector: 'app-admin-action-details',
  templateUrl: 'action-details.component.html',
  styleUrls: ['action-details.component.scss', '../../../assets/scss/_validation.scss']
})
export class AdminActionDetailsComponent {
  @Input() permission = 0;
  @Input() message: UserActionItem | undefined = undefined;
  @Output() close = new EventEmitter();

  constructor() { }
}
