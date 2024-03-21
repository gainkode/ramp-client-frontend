import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { HttpClientModule } from '@angular/common/http';
import { Apollo } from 'apollo-angular';
import { HttpLink } from 'apollo-angular/http';
import { onError } from 'apollo-link-error';
import { ApolloLink, InMemoryCache, split } from '@apollo/client/core';
import { fromPromise } from 'apollo-link';
import ApolloLinkTimeout from 'apollo-link-timeout';
import { setContext } from '@apollo/client/link/context';
import { SocialLoginModule, SocialAuthServiceConfig, GoogleLoginProvider } from '@abacritt/angularx-social-login';
import { AuthService } from './services/auth.service';
import { ErrorService } from './services/error.service';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { PaymentDataService } from './services/payment.service';
import { NotificationService } from './services/notification.service';
import { CommonDataService } from './services/common-data.service';
import { getMainDefinition } from '@apollo/client/utilities';
import { createApiHash } from './utils/utils';
import { GraphQLWsLink } from '@apollo/client/link/subscriptions';
import { createClient } from 'graphql-ws';
import { DirectiveModule } from './directives/directives.module';
import { ProfileDataService } from './services/profile.service';
import { ExchangeRateService } from './services/rate.service';
import { WidgetPagerService } from './services/widget-pager.service';
import { WidgetPaymentPagerService } from './services/widget-payment-pager.service';
import { WidgetService } from './services/widget.service';
import { EnvServiceProvider, EnvService, EnvServiceFactory } from './services/env.service';
import { shareReplay } from 'rxjs/operators';
import { TableModule } from 'components/data-list/table/table.module';
import { TranslocoRootModule } from 'transloco-root.module';
import { AppGuard } from 'app.guard';
import { Router } from '@angular/router';
import { ForbiddenComponent } from 'components/common/forbidden/forbidden.component';

function socialConfigFactory(): SocialAuthServiceConfig {
	EnvServiceFactory.call(undefined);
	return {
		autoLogin: false,
		providers: [
			{
				id: GoogleLoginProvider.PROVIDER_ID,
				provider: new GoogleLoginProvider(EnvService.googleId)
			},
		]
	} as SocialAuthServiceConfig;
}

@NgModule({
	declarations: [
		AppComponent,
		ForbiddenComponent
	],
	imports: [
		BrowserModule,
		AppRoutingModule,
		HttpClientModule,
		BrowserAnimationsModule,
		SocialLoginModule,
		DirectiveModule,
		TranslocoRootModule,
		TableModule
	],
	providers: [
		AppGuard,
		EnvServiceProvider,
		Apollo,
		{
			provide: 'SocialAuthServiceConfig',
			useFactory: socialConfigFactory
		},
		AuthService,
		ProfileDataService,
		CommonDataService,
		PaymentDataService,
		NotificationService,
		ErrorService,
		ExchangeRateService,
		WidgetPagerService,
		WidgetPaymentPagerService,
		WidgetService
	],
	bootstrap: [AppComponent]
})
export class AppModule {
	errorLink = onError(({ forward, graphQLErrors, networkError, operation }) => {
		if (graphQLErrors) {
			for (const err of graphQLErrors) {
	
				if (err.extensions !== null) {
					const code = err.extensions?.code as string;
					if (code.toUpperCase() === 'UNAUTHENTICATED') {
						const forceRefreshToken = true;
						if (operation.operationName === 'RefreshToken') {
							console.error('RefreshToken failed', err);
							return undefined;
						}
						if (forceRefreshToken) {
							const refreshToken = this.authService.refreshToken().pipe(shareReplay(1)).toPromise();
							return fromPromise(
								refreshToken.catch(() => {
									this.authService.logout();
									return forward(operation);
								})
							).filter(value => Boolean(value)).flatMap(() => forward(operation));
						}
					}

					if (code === 'auth.recaptcha_invalid'){
						localStorage.removeItem('recaptchaId');
					}

					if (code === 'auth.account_banned_or_closed'){
						this.authService.logout();

						localStorage.setItem('LAST_SAVED_URL', `${this.router.url}`);
						
						void this.router.navigate(['/forbidden']);
					}

					let codeValue = err.extensions?.code ?? 'INTERNAL_SERVER_ERROR';

					if (codeValue === 'INTERNAL_SERVER_ERROR' && err.message) {
						codeValue = err.message;
					}

					if (operation.operationName === 'GetRates') {
						sessionStorage.setItem('currentRateErrorCode', codeValue);
						sessionStorage.setItem('currentRateError', err.message);
					} else {
						sessionStorage.setItem('currentErrorCode', codeValue);
						sessionStorage.setItem('currentError', err.message);
					}
				}
			}
		}

		if (networkError) {
			console.log('Network error occured: ', operation.operationName, networkError);

			if (operation.operationName !== 'MyStateTest') {
				console.error('network error', networkError.name, networkError);
			}
			if (operation.operationName === 'GetRates') {
				sessionStorage.setItem('currentRateErrorCode', networkError.name);
				sessionStorage.setItem('currentRateError', networkError.message);
			} else {
				sessionStorage.setItem('currentErrorCode', networkError.name);
				sessionStorage.setItem('currentError', networkError.message);
			}
		}

		return undefined;
	});

	authLink = setContext((operation, context) => {
		if (operation.operationName === 'GetRates') {
			sessionStorage.setItem('currentRateErrorCode', '');
			sessionStorage.setItem('currentRateError', '');
		} else {
			sessionStorage.setItem('currentErrorCode', '');
			sessionStorage.setItem('currentError', '');
		}
		if (operation.operationName === 'AddMyWidgetUserParams') {
			const timestamp = new Date().getTime();
			const apiHash = createApiHash(EnvService.widget_api_key, EnvService.widget_secret, timestamp);
			return {
				headers: {
					'x-auth-timestamp': timestamp.toString(),
					'x-auth-id': EnvService.widget_api_key,
					'x-auth-key': apiHash,
				}
			};
		} else {
			const token = localStorage.getItem('currentToken');
			
			return token === null ? {} : { headers: { Authorization: `Bearer ${token}` } };
		}
	});

	headersLink = setContext((operation, context) => {
		const headers = new Headers();
		headers.append('Accept', 'charset=utf-8');
		headers.append('Feature-Policy', 'camera: \'self\'');
    
		return { headers };
	});

	constructor(
		private router: Router,
		private apollo: Apollo,
		private httpLink: HttpLink,
		private authService: AuthService) {
		EnvServiceFactory.call(undefined);
		const http = this.httpLink.create({
			uri: `${EnvService.api_server}/gql/api`,
			withCredentials: true
		});
		const timeoutLink = new ApolloLinkTimeout(EnvService.api_timeout ?? 10000); // 10 second timeout
		const timeoutHttp = timeoutLink.concat(http);

		// Transaport graphql-ws
		const webSocketLink = new GraphQLWsLink(createClient({
			url: `${EnvService.ws_server}/subscriptions`,
			lazy: true,
			connectionParams: {
				authToken: `Bearer ${localStorage.getItem('currentToken')}`
			},
		}));

		const transportLink: ApolloLink = split(
			// split based on operation type
			({ query }) => {
				const definition = getMainDefinition(query);
				return definition.kind === 'OperationDefinition' && definition.operation === 'subscription';
			},
			webSocketLink,
			ApolloLink.from([this.authLink, timeoutHttp])
		);
		const apolloLink = ApolloLink.from([
			this.errorLink as any,
			this.headersLink,
			transportLink
		]);

		this.apollo.create({
			link: apolloLink,
			cache: new InMemoryCache()
		});
	}
}
