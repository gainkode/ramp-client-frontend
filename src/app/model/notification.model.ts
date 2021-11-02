import { DatePipe } from '@angular/common';
import { UserNotification } from './generated-models';
import { UserNotificationCodeList } from './payment.model';

export class NotificationItem {
    id = '';
    userId = '';
    notificationType = '';
    createdDate = '';
    viewedDate = '';
    text = '';
    userNotificationTypeCode = '';
    selected = false;

    constructor(data: UserNotification | null) {
        if (data !== null) {
            this.id = data.userNotificationId;
            const datepipe: DatePipe = new DatePipe('en-US');
            this.createdDate = datepipe.transform(data.created, 'dd-MM-YYYY HH:mm:ss') as string;
            this.viewedDate = datepipe.transform(data.viewed, 'dd-MM-YYYY HH:mm:ss') as string;
            this.userId = data.userId as string;
            this.text = data.text as string;
            this.userNotificationTypeCode = data.userNotificationTypeCode;
        }
    }

    get notificationCode(): string {
        return UserNotificationCodeList.find((t) => t.id === this.userNotificationTypeCode)?.name as string;
    }

    getShortText(len: number): string {
        let result = '';
        if (this.text) {
            if (this.text.length > len) {
                result = `${this.text.slice(0, len - 3)}...`;
            }
        }
        return result;
    }
}
