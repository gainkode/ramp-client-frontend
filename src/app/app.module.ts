import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { HttpClientModule } from '@angular/common/http';
import { APOLLO_OPTIONS } from 'apollo-angular';
import { HttpLink, HttpLinkHandler } from 'apollo-angular/http';
import { onError } from 'apollo-link-error';
import { ApolloLink, InMemoryCache, RequestHandler } from '@apollo/client/core';
import {
  SocialLoginModule, SocialAuthServiceConfig,
  GoogleLoginProvider, FacebookLoginProvider
} from 'angularx-social-login';
import { AuthService } from './services/auth.service';
import { ErrorService } from './services/error.service';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { environment } from 'src/environments/environment';

const errorLink = onError(({ graphQLErrors, networkError, response }) => {
  if (graphQLErrors) {
    for (let err of graphQLErrors) {
      if (err.extensions !== null) {
        err.message = err.extensions?.code;
      } else {
        err.message = 'no_code';
      }
    }
  }
  if (networkError) {
    console.log(networkError);
  };
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
      provide: APOLLO_OPTIONS,
      useFactory: (httpLink: HttpLink) => {
        return {
          cache: new InMemoryCache(),
          link: ApolloLink.from([
            errorLink as any, 
            httpLink.create({ uri: environment.api_server })
          ])
        };
      },
      deps: [HttpLink],
    },
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
    ErrorService
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
