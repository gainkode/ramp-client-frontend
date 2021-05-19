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
import { setContext } from '@apollo/client/link/context';
import {
  SocialLoginModule, SocialAuthServiceConfig,
  GoogleLoginProvider, FacebookLoginProvider
} from 'angularx-social-login';
import { AuthService } from './services/auth.service';
import { AdminDataService } from './services/admin-data.service';
import { ErrorService } from './services/error.service';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { environment } from 'src/environments/environment';
import { QuickCheckoutDataService } from './services/quick-checkout.service';
import { NotificationService } from './services/notification.service';
import { CommonDataService } from './services/common-data.service';
import { getMainDefinition } from '@apollo/client/utilities';
import { SubscriptionClient } from 'subscriptions-transport-ws';

@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    HttpClientModule,
    BrowserAnimationsModule,
    SocialLoginModule
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
    AdminDataService,
    CommonDataService,
    QuickCheckoutDataService,
    NotificationService,
    ErrorService
  ],
  bootstrap: [AppComponent]
})
export class AppModule {
  errorLink = onError(({ forward, graphQLErrors, networkError, operation }) => {
    if (graphQLErrors) {
      sessionStorage.setItem('currentError', '');
      for (const err of graphQLErrors) {
        if (err.extensions !== null) {
          const code = err.extensions?.code as string;
          if (code.toUpperCase() === 'UNAUTHENTICATED') {
            console.log('UNAUTHENTICATED');
            const refreshToken = this.authService.refreshToken().toPromise();
            return fromPromise(
              refreshToken.catch(error => {
                this.authService.logout();
                return forward(operation);
              })
            ).filter(value => Boolean(value)).flatMap(accessToken => {
              console.log('access', accessToken.refreshToken);
              return forward(operation);
            });
          }
          sessionStorage.setItem('currentError', err.extensions?.code);
        }
      }
    }
    if (networkError) {
      console.log(networkError);
    }
    return forward(operation);
  });

  authLink = setContext((operation, context) => {
    const token = sessionStorage.getItem('currentToken');
    if (token === null) {
      return {};
    } else {
      return { headers: { Authorization: `Bearer ${token}` } };
    }
  });

  headersLink = setContext((operation, context) => ({
    headers: { Accept: 'charset=utf-8' }
  }));

  constructor(private apollo: Apollo, private httpLink: HttpLink, private authService: AuthService) {
    const cookieName = 'cookieconsent_status';
    const w = window as any;
    const consentStatus = w.cookieconsent.utils.getCookie(cookieName);
    const allowCookies = (consentStatus === 'allow');
    const http = httpLink.create({
      uri: `${environment.api_server}/gql/api`,
      withCredentials: allowCookies
    });

    const webSocketClient: SubscriptionClient = new SubscriptionClient(`${environment.ws_server}/subscriptions`, {
			lazy: true,
			reconnect: true,
			connectionParams: () => {
        console.log('ws', sessionStorage.getItem('currentToken'));
        return {
          authToken: `Bearer ${sessionStorage.getItem('currentToken')}`
        };
      }
		});
    const webSocketLink = new WebSocketLink(webSocketClient);

    const transportLink: ApolloLink = split(
      // split based on operation type
      ({ query }) => {
        let definition = getMainDefinition(query);
        return definition.kind === 'OperationDefinition' && definition.operation === 'subscription';
      },
      webSocketLink,
      ApolloLink.from([this.authLink, http])
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
