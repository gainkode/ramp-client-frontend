import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { HttpClientModule } from '@angular/common/http';
import { Apollo } from 'apollo-angular';
import { HttpLink } from 'apollo-angular/http';
import { WebSocketLink } from '@apollo/client/link/ws';
import { onError } from 'apollo-link-error';
import { ApolloLink, InMemoryCache, split } from '@apollo/client/core';
import { fromPromise } from 'apollo-link';
import ApolloLinkTimeout from 'apollo-link-timeout';
import { setContext } from '@apollo/client/link/context';
import {
  SocialLoginModule, SocialAuthServiceConfig,
  GoogleLoginProvider, FacebookLoginProvider
} from 'angularx-social-login';
import { AuthService } from './services/auth.service';
import { ErrorService } from './services/error.service';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { environment } from 'src/environments/environment';
import { PaymentDataService } from './services/payment.service';
import { NotificationService } from './services/notification.service';
import { CommonDataService } from './services/common-data.service';
import { getMainDefinition } from '@apollo/client/utilities';
import { SubscriptionClient } from 'subscriptions-transport-ws';
import { DirectiveModule } from './directives/directives.module';
import { ProfileDataService } from './services/profile.service';
import { ExchangeRateService } from './services/rate.service';
import { WidgetPagerService } from './services/widget-pager.service';

@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    HttpClientModule,
    BrowserAnimationsModule,
    SocialLoginModule,
    DirectiveModule
  ],
  providers: [
    {
      provide: 'SocialAuthServiceConfig',
      useValue: {
        autoLogin: false,
        providers: [
          {
            id: GoogleLoginProvider.PROVIDER_ID,
            provider: new GoogleLoginProvider(environment.googleClientId)
          },
          {
            id: FacebookLoginProvider.PROVIDER_ID,
            provider: new FacebookLoginProvider(environment.facebookClientId)
          }
        ]
      } as SocialAuthServiceConfig
    },
    AuthService,
    ProfileDataService,
    CommonDataService,
    PaymentDataService,
    NotificationService,
    ErrorService,
    ExchangeRateService,
    WidgetPagerService
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
            console.error('UNAUTHENTICATED');
            const refreshToken = this.authService.refreshToken().toPromise();
            return fromPromise(
              refreshToken.catch(error => {
                this.authService.logout();
                return forward(operation);
              })
            ).filter(value => Boolean(value)).flatMap(accessToken => {
              return forward(operation);
            });
          }
          let codeValue = err.extensions?.code ?? 'INTERNAL_SERVER_ERROR';
          if (codeValue === 'INTERNAL_SERVER_ERROR' && err.message) {
            codeValue = err.message;
          }
          if (operation.operationName === 'GetRates') {
            sessionStorage.setItem('currentRateError', codeValue);
          } else {
            sessionStorage.setItem('currentError', codeValue);
          }
        }
      }
    }
    if (networkError) {
      console.error('network error', networkError.name, networkError);
      if (operation.operationName === 'GetRates') {
        sessionStorage.setItem('currentRateError', networkError.name);
      } else {
        sessionStorage.setItem('currentError', networkError.name);
      }
    }
    return undefined;
  });

  authLink = setContext((operation, context) => {
    if (operation.operationName === 'GetRates') {
      sessionStorage.setItem('currentRateError', '');
    } else {
      sessionStorage.setItem('currentError', '');
    }
    const token = sessionStorage.getItem('currentToken');
    if (token === null) {
      return {};
    } else {
      return { headers: { Authorization: `Bearer ${token}` } };
    }
  });

  headersLink = setContext((operation, context) => {
    const headers = new Headers();
    headers.append('Accept', 'charset=utf-8');
    headers.append('Feature-Policy', 'camera: \'self\'');
  });

  constructor(private apollo: Apollo, private httpLink: HttpLink, private authService: AuthService) {
    const cookieName = 'cookieconsent_status';
    const w = window as any;
    const consentStatus = w.cookieconsent.utils.getCookie(cookieName);
    const allowCookies = (consentStatus === 'allow');
    const http = httpLink.create({
      uri: `${environment.api_server}/gql/api`,
      withCredentials: allowCookies
    });
    const timeoutLink = new ApolloLinkTimeout(environment.api_timeout ?? 10000); // 10 second timeout
    const timeoutHttp = timeoutLink.concat(http);

    const webSocketClient: SubscriptionClient = new SubscriptionClient(
      `${environment.ws_server}/subscriptions`,
      {
        lazy: true,
        reconnect: true,
        connectionParams: () => {
          return {
            authToken: `Bearer ${sessionStorage.getItem('currentToken')}`
          };
        }
      });
    const webSocketLink = new WebSocketLink(webSocketClient);

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
    if (allowCookies) {
      apollo.create({
        link: apolloLink,
        cache: new InMemoryCache()
      });
    }
  }
}
