import { Component, EventEmitter, Input, Output } from '@angular/core';
import { NotificationItem } from 'src/app/model/notification.model';

@Component({
  selector: 'app-notification-details',
  templateUrl: 'notification-details.component.html',
  styleUrls: ['notification-details.component.scss']
})
export class NotificationDetailsComponent {
  @Input() message: NotificationItem | undefined = undefined;
  @Output() resend = new EventEmitter<string>();

  constructor() {
  }
}
