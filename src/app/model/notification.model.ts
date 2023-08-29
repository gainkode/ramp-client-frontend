import { DatePipe } from '@angular/common';
import { UserNotification } from './generated-models';
import { UserNotificationCodeList } from './payment.model';

export class NotificationItem {
	id = '';
	userId = '';
	userEmail = '';
	level = '';
	created = '';
	viewed = '';
	text = '';
	title = '';
	userNotificationTypeCode = '';
	selected = false;

	constructor(data: UserNotification | null) {
		if (data !== null) {
			this.id = data.userNotificationId;
			const datepipe: DatePipe = new DatePipe('en-US');

			this.created = (data.created) ? datepipe.transform(data.created, 'dd MMM YYYY HH:mm:ss') as string : '';
			this.viewed = (data.viewed) ? datepipe.transform(data.viewed, 'dd MMM YYYY HH:mm:ss') as string : '';

			this.userId = data.userId as string;
			this.userEmail = data.user?.email ?? '';
			this.text = data.text as string;
			this.title = data.title ?? 'Notification';
			this.level = data.userNotificationLevel as string ?? '';
			this.userNotificationTypeCode = data.userNotificationTypeCode;
		}
	}

	get notificationCode(): string {
		return UserNotificationCodeList.find((t) => t.id === this.userNotificationTypeCode)?.name as string;
	}

	get viewedStatus(): boolean {
		return this.viewed !== '';
	}

	setViewed(dt: Date): void {
		const datepipe: DatePipe = new DatePipe('en-US');
		this.viewed = datepipe.transform(dt, 'dd MMM YYYY HH:mm:ss') ?? '';
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

	getViewedIcon(path: string): string {
		return `${path}/navigation/${(this.viewedStatus) ? '__temp_notification_viewed' : '__temp_notification_new'}.svg`;
	}

	getLevelIcon(path: string): string {
		let levelName = '';
		switch (this.level) {
			case 'Request':
				levelName = 'request';
				break;
			case 'Debug':
				levelName = 'debug';
				break;
			case 'Info':
				levelName = 'info';
				break;
			case 'Warning':
				levelName = 'warning';
				break;
			case 'Error':
				levelName = 'error';
				break;
		}
		return `${path}/navigation/${levelName}_24_24.svg`;
	}
}
