import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { HttpClientModule } from '@angular/common/http';
import { Apollo } from 'apollo-angular';
import { HttpLink } from 'apollo-angular/http';
import { onError } from 'apollo-link-error';
import { ApolloLink, InMemoryCache } from '@apollo/client/core';
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



import { Observable } from 'apollo-link';

const promiseToObservable = (promise: Promise<any>) =>
  new Observable((subscriber: any) => {
    promise.then(
      value => {
        if (subscriber.closed) {
          return;
        }
        subscriber.next(value);
        subscriber.complete();
      },
      err => subscriber.error(err)
    );
  });

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
    ErrorService
  ],
  bootstrap: [AppComponent]
})
export class AppModule {

  errorLink = onError(({ forward, graphQLErrors, networkError, operation }) => {
    if (graphQLErrors) {
      for (let err of graphQLErrors) {
        if (err.extensions !== null) {
          const code = err.extensions?.code as string;
          console.log(code);
          if (code.toUpperCase() === 'UNAUTHENTICATED') {
            console.log('Need to get new token');
            return promiseToObservable(this.authService.refreshToken().toPromise()).flatMap(() => forward(operation));
          }
          err.message = err.extensions?.code;
        } else {
          err.message = 'no_code';
        }
      }
    }
    if (networkError) {
      console.log(networkError);
    };
    return forward(operation);
  });

  authLink = setContext((operation, context) => {
    const token = sessionStorage.getItem('currentToken');
    if (token === null) {
      return {};
    } else {
      console.log('refresh token');
      // this.authService.refreshToken().subscribe(data => {
      //   console.log(data);
      // });
      return {
        headers: { Authorization: `Bearer ${token}` }
      };
    }
  });
  
  headersLink = setContext((operation, context) => ({
    headers: { Accept: 'charset=utf-8' }
  }));
  
  constructor(private apollo: Apollo, private httpLink: HttpLink, private authService: AuthService) {
    apollo.create({
      link: ApolloLink.from([
        this.errorLink as any,
        this.headersLink,
        this.authLink,
        httpLink.create({
          uri: environment.api_server,
          withCredentials: true
        })
      ]),
      cache: new InMemoryCache(),
    });
  }
}
