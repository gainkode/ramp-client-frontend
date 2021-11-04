import { DatePipe } from '@angular/common';
import { UserNotification } from './generated-models';
import { UserNotificationCodeList } from './payment.model';

export class NotificationItem {
    id = '';
    userId = '';
    notificationType = '';
    created = '';
    createdDate = '';
    viewedDate = '';
    createdTime = '';
    viewedTime = '';
    text = '';
    userNotificationTypeCode = '';
    selected = false;

    constructor(data: UserNotification | null) {
        if (data !== null) {
            this.id = data.userNotificationId;
            const datepipe: DatePipe = new DatePipe('en-US');
            //this.createdDate = (data.created) ? datepipe.transform(data.created, 'dd MMM YYYY HH:mm:ss') as string : '';
            //this.viewedDate = (data.viewed) ? datepipe.transform(data.viewed, 'dd MMM YYYY HH:mm:ss') as string : '';

            this.created = (data.created) ? datepipe.transform(data.created, 'dd MMM YYYY HH:mm:ss') as string : '';
            this.createdDate = (data.created) ? datepipe.transform(data.created, 'dd MMM YYYY') as string : '';
            this.viewedDate = (data.viewed) ? datepipe.transform(data.viewed, 'dd MMM YYYY') as string : '';
            this.createdTime = (data.created) ? datepipe.transform(data.created, 'HH:mm:ss') as string : '';
            this.viewedTime = (data.viewed) ? datepipe.transform(data.viewed, 'HH:mm:ss') as string : '';

            this.userId = data.userId as string;
            this.text = data.text as string;
            this.userNotificationTypeCode = data.userNotificationTypeCode;
        }
    }

    get notificationCode(): string {
        return UserNotificationCodeList.find((t) => t.id === this.userNotificationTypeCode)?.name as string;
    }

    get viewedStatus(): boolean {
        return this.viewedDate !== '';
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
