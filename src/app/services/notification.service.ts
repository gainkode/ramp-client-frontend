import { Injectable } from '@angular/core';
import { Apollo, gql } from 'apollo-angular';
import { Observable } from 'rxjs';
import { TransactionServiceNotificationType } from '../model/generated-models';
import { GraphQLWsLink } from '@apollo/client/link/subscriptions';
import { createClient } from 'graphql-ws';
import { EnvService } from './env.service';
import { ApolloClient, ApolloLink, InMemoryCache, split } from '@apollo/client/core';
import { getMainDefinition } from '@apollo/client/utilities';

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

const SUBSCRIBE_KYC_COMPLETED_NOTIFICATIONS = gql`
subscription onKycCompletedNotification {
  kycCompletedNotification
}
`;

const SUBSCRIBE_EXTERNAL_PAYMENT_COMPLETED_NOTIFICATIONS = gql`
subscription onExternalPaymentCompletedNotification {
  externalPaymentCompletedNotification
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
	private apolloNotificationClient;
	constructor(apollo: Apollo) {
		this.apolloNotificationClient = apollo;
	}
  
	wsClientInit(): void{
		console.log(`wsClientInit with token ${localStorage.getItem('currentToken')}`);
		const webSocketLink = new GraphQLWsLink(createClient({
			url: `${EnvService.ws_server}/subscriptions`,
			lazy: true,
			connectionParams: {
				authToken: `Bearer ${localStorage.getItem('currentToken')}`
			},
		}));
		const transportLink: ApolloLink = split(
			({ query }) => {
				const definition = getMainDefinition(query);
				return definition.kind === 'OperationDefinition' && definition.operation === 'subscription';
			},
			webSocketLink
		);
		const apolloLink = ApolloLink.from([
			transportLink
		]);

		this.apolloNotificationClient = new ApolloClient({
			link: apolloLink,
			cache: new InMemoryCache()
		});
	}

	sendTestNotification(): Observable<any> {
		return this.apolloNotificationClient.mutate({
			mutation: SEND_TEST_NOTIFICATION_POST
		});
	}

	sendTestKycNotification(): Observable<any> {
		return this.apolloNotificationClient.mutate({
			mutation: SEND_TEST_KYC_NOTIFICATION_POST
		});
	}

	sendTestTransactionNotification(notificationType: TransactionServiceNotificationType): Observable<any> {
		return this.apolloNotificationClient.mutate({
			mutation: SEND_TEST_TRANSACTION_NOTIFICATION_POST,
			variables: {
				type: notificationType
			}
		});
	}

	subscribeToTransactionNotifications(): Observable<any> {
		return this.apolloNotificationClient.subscribe({
			query: SUBSCRIBE_TRANSACTION_NOTIFICATIONS,
			fetchPolicy: 'no-cache'
		});
	}

	subscribeToNotifications(): Observable<any> {
		return this.apolloNotificationClient.subscribe({
			query: SUBSCRIBE_NOTIFICATIONS,
			fetchPolicy: 'no-cache'
		});
	}

	subscribeToKycNotifications(): Observable<any> {
		return this.apolloNotificationClient.subscribe({
			query: SUBSCRIBE_KYC_NOTIFICATIONS,
			fetchPolicy: 'no-cache'
		});
	}

	subscribeToKycCompleteNotifications(): Observable<any> {
		return this.apolloNotificationClient.subscribe({
			query: SUBSCRIBE_KYC_COMPLETED_NOTIFICATIONS,
			fetchPolicy: 'no-cache'
		});
	}

	subscribeToExternalPaymentCompleteNotifications(): Observable<any> {
		return this.apolloNotificationClient.subscribe({
			query: SUBSCRIBE_EXTERNAL_PAYMENT_COMPLETED_NOTIFICATIONS,
			fetchPolicy: 'no-cache'
		});
	}
}
