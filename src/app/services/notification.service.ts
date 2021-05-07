import { Injectable } from '@angular/core';
import { Apollo, gql } from 'apollo-angular';
import { Observable } from 'rxjs';

const SUBSCRIBE_NOTIFICATIONS = gql`
subscription onNewNotification {
  newNotification
}
`;

const SEND_TEST_NOTIFICATION_POST = gql`
mutation SendTestNotification {
  sendTestNotification
}
`;

@Injectable()
export class NotificationService {
  constructor(private apollo: Apollo) { }

  sendTestNotification(): Observable<any> {
    return this.apollo.mutate({
      mutation: SEND_TEST_NOTIFICATION_POST
    });
  }

  subscribeToNotifications(): Observable<any> {
    return this.apollo.subscribe({
      query: SUBSCRIBE_NOTIFICATIONS,
      fetchPolicy: "no-cache"
    })
  }
}
