import { DatePipe } from '@angular/common';
import { Message } from './generated-models';

export class MessageItem {
	id = '';
	userId = '';
	messageEmailId = '';
	messageStatus = '';
	messageType = '';
	objectId = '';
	params = {};
	userNotificationId = '';
	created = '';
	userEmail = '';

	constructor(data: Message | null) {
		if (data !== null) {
			this.id = data.messageId;
			this.userId = data.userId as string;
			this.messageEmailId = data.messageEmailId;
			this.messageStatus = data.messageStatus;
			this.messageType = data.messageType;
			this.objectId = data.objectId;
			this.params = data.params ? JSON.parse(data.params) : undefined;
			this.userNotificationId = data.userNotificationId;

			if(data.user){
				this.userEmail = data.user.email;
			}
			const datepipe: DatePipe = new DatePipe('en-US');

			this.created = (data.created) ? datepipe.transform(data.created, 'dd MMM YYYY HH:mm:ss') as string : '';
		}
	}
}
