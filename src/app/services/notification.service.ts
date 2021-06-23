import { Injectable } from '@angular/core';
import { Apollo, gql } from 'apollo-angular';
import { Observable } from 'rxjs';

const SUBSCRIBE_NOTIFICATIONS = gql`
subscription onNewNotification {
  newNotification
}
`;

const SUBSCRIBE_TRANSACTION_NOTIFICATIONS = gql`
subscription onTransactionServiceNotification {
  transactionServiceNotification
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

  subscribeToTransactionNotifications(): Observable<any> {
    return this.apollo.subscribe({
      query: SUBSCRIBE_TRANSACTION_NOTIFICATIONS,
      fetchPolicy: 'no-cache'
    });
  }

  subscribeToNotifications(): Observable<any> {
    return this.apollo.subscribe({
      query: SUBSCRIBE_NOTIFICATIONS,
      fetchPolicy: 'no-cache'
    });
  }
}
