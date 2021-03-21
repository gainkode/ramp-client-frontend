import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  title = 'cm-eWallet';
  version = '0.1.1';
  copyrightYears = '2021';

  constructor(private router: Router) {

  }
  // setCookies(status: boolean): void {
  //   console.log(status ? 'enable cookies' : 'disable cookies');
  // }

  ngOnInit(): void {
    const w = window as any;
    const r = this.router;
    w.cookieconsent.initialise({
      cookie: {
        domain: environment.cookieDomain
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
      type: 'opt-out',
      content: {
        message: 'This website uses cookies to ensure you get the best experience on our website.',
        dismiss: 'Got it!',
        deny: 'Refuse cookies',
        link: 'Learn more',
        href: 'https://cookiesandyou.com',
        policy: 'Cookie Policy'
      },
      onStatusChange: function (status: any) {
        window.location.reload();
      }
    });
  }
}
