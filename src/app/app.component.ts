import { Component, OnInit } from '@angular/core';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  title = 'GetCoins';
  version = '0.1.1';
  copyrightYears = '2021';

  ngOnInit(): void {
    const w = window as any;
    w.cookieconsent.initialise({
      cookie: {
        domain: environment.cookieDomain,
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
        dismiss: 'Got it!',
        deny: 'Decline',
        allow: 'Accept',
        link: 'Cookies Policy',
        href: '/terms',
        policy: 'Cookie Policy'
      },
      onStatusChange: function(status: any) {
        window.location.reload();
      }
    });
  }
}
