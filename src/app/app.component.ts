import { Component, Inject, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { take } from 'rxjs/operators';
import { User } from './model/generated-models';
import { Title } from '@angular/platform-browser';
import { AuthService } from './services/auth.service';
import { CommonDataService } from './services/common-data.service';
import { NotificationService } from './services/notification.service';
import { ProfileDataService } from './services/profile.service';
import { EnvService } from './services/env.service';
import { DOCUMENT } from '@angular/common';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit, OnDestroy {
  private subscriptions: Subscription = new Subscription();

  constructor(
    @Inject(DOCUMENT) private document: Document,
    private commonService: CommonDataService,
    private profileService: ProfileDataService,
    private notification: NotificationService,
    private auth: AuthService,
    private titleService: Title
  ) {
    this.titleService.setTitle(EnvService.product);
  }
  
  ngOnInit(): void {
    const totalData = this.commonService.getMyTransactionsTotal();
    this.subscriptions.add(
      totalData.valueChanges.pipe(take(1)).subscribe(({ data }) => {
        this.startKycNotifications();
      }, (error) => {

      })
    );
    this.loadFont();
    this.setCookiePanel();
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  private setCookiePanel(): void {
    const url = window.location.href;
    const whiteList = (url.includes('/payment/widget/') || url.includes('/terms'));
    if (!whiteList) {
      const w = window as any;
      w.cookieconsent.initialise({
        cookie: {
          domain: EnvService.cookieDomain,
          secure: false // If secure is true, the cookies will only be allowed over https
        },
        position: 'bottom',
        theme: 'classic',
        palette: {
          popup: {
            background: '#000000',
            text: '#ffffff'
          },
          button: {
            background: '#c1c1c1',
            text: '#000000'
          }
        },
        type: 'info',//'opt-out',
        content: {
          message: 'We use cookies to improve and personalize your experience using our website. Learn more about our',
          dismiss: 'Accept',
          deny: 'Decline',
          allow: 'Accept',
          link: 'Cookies Policy',
          href: EnvService.cookie_link,
          policy: 'Cookie Policy'
        },
        onStatusChange: function (status: any) {
          window.location.reload();
        }
      });
    }
  }

  private loadFont() {
    // get head
    const head = this.document.getElementsByTagName('head')[0];
    let themeLink = this.document.getElementById(
      'main-font'
    ) as HTMLLinkElement;
    // Set the font link
    const mainFont = EnvService.main_font;
    const mainFontJoined = mainFont.replace(' ', '+');
    const href = `https://fonts.googleapis.com/css2?family=${mainFontJoined}:ital,wght@0,300;0,400;0,500;0,700;1,300;1,400;1,500;1,700&display=swap`;
    if (themeLink) {
      themeLink.href = href;
    } else {
      // if link doesn't exist, we create link tag
      const style = this.document.createElement('link');
      style.id = 'main-font';
      style.rel = 'stylesheet';
      style.href = href;
      head.appendChild(style);
    }
    // Set the font variable
    this.document.documentElement.style.setProperty('--font_main', mainFont);
  }

  private startKycNotifications(): void {
    this.subscriptions.add(
      this.notification.subscribeToKycNotifications().subscribe(
        ({ data }) => {
          this.loadAccountData();
        },
        (error) => {
          console.error('KYC notification error', error);
        }
      )
    );
  }

  private loadAccountData(): void {
    const meQuery$ = this.profileService.getProfileData().valueChanges.pipe(take(1));
    this.subscriptions.add(
      meQuery$.subscribe(({ data }) => {
        if (data) {
          this.auth.setUser(data.me as User);
        }
      }, (error) => {
        
      })
    );
  }
}
