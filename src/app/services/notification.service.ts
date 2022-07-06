import { Injectable } from '@angular/core';
import { Apollo, gql } from 'apollo-angular';
import { Observable } from 'rxjs';
import { TransactionServiceNotificationType } from '../model/generated-models';

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

const SUBSCRIBE_KYC_NOTIFICATIONS = gql`
subscription onKycServiceNotification {
  kycServiceNotification
}
`;

const SEND_TEST_NOTIFICATION_POST = gql`
mutation SendTestNotification {
  sendTestNotification
}
`;

const SEND_TEST_KYC_NOTIFICATION_POST = gql`
mutation SendTestKycServiceNotification {
  sendTestKycServiceNotification
}
`;

const SEND_TEST_TRANSACTION_NOTIFICATION_POST = gql`
mutation SendTestTransactionServiceNotification(
  $type: TransactionServiceNotificationType!) {
  sendTestTransactionServiceNotification(
    type: $type
  )
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

  sendTestKycNotification(): Observable<any> {
    return this.apollo.mutate({
      mutation: SEND_TEST_KYC_NOTIFICATION_POST
    });
  }

  sendTestTransactionNotification(notificationType: TransactionServiceNotificationType): Observable<any> {
    return this.apollo.mutate({
      mutation: SEND_TEST_TRANSACTION_NOTIFICATION_POST,
      variables: {
        type: notificationType
      }
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

  subscribeToKycNotifications(): Observable<any> {
    return this.apollo.subscribe({
      query: SUBSCRIBE_KYC_NOTIFICATIONS,
      fetchPolicy: 'no-cache'
    });
  }
}
