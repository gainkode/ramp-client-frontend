import { Component, Inject, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { shareReplay, take } from 'rxjs/operators';
import { User } from './model/generated-models';
import { Title } from '@angular/platform-browser';
import { AuthService } from './services/auth.service';
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
		private profileService: ProfileDataService,
		private notification: NotificationService,
		private auth: AuthService,
		private titleService: Title
	) {
		this.titleService.setTitle(EnvService.product);
	}

	ngOnInit(): void {
		if(this.auth.user){
			this.startKycNotifications();
		}
		this.loadFont();
		this.setCookiePanel();
	}

	ngOnDestroy(): void {
		this.subscriptions.unsubscribe();
	}

	private setCookiePanel(): void {
		const url = window.location.href;
		const whiteList = (url.includes('/payment/widget/') || url.includes('/terms') || url.includes('/payment/quickcheckout'));
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
					href: 'https://iramp.io/cookies-policy/',
					policy: 'Cookie Policy'
				},
				onStatusChange: function () {
					window.location.reload();
				}
			});
		}
	}

	private loadFont(): void {
		// get head
		const head = this.document.getElementsByTagName('head')[0];
		const themeLink = this.document.getElementById('main-font') as HTMLLinkElement;
		// Set the font link
		const mainFont = EnvService.main_font;
		const mainFontJoined = mainFont.replace(' ', '+');
		const fontRef = `https://fonts.googleapis.com/css2?family=${mainFontJoined}:ital,wght@0,300;0,400;0,500;0,700;1,300;1,400;1,500;1,700&display=swap`;
		if (themeLink) {
			themeLink.href = fontRef;
		} else {
			// if link doesn't exist, we create link tag
			const style = this.document.createElement('link');
			style.id = 'main-font';
			style.rel = 'stylesheet';
			style.href = fontRef;
			head.appendChild(style);
		}
		const iconLink = this.document.getElementById('icon-ref') as HTMLLinkElement;
		const iconRef = `${EnvService.image_host}/images/favicon.ico`;
		if (iconLink) {
			iconLink.href = iconRef;
		} else {
			// if link doesn't exist, we create link tag
			const style = this.document.createElement('link');
			style.id = 'icon-ref';
			style.rel = 'icon';
			style.type = 'image/x-icon';
			style.href = iconRef;
			head.appendChild(style);
		}

		// Set the font variable
		this.document.documentElement.style.setProperty('--font_main', mainFont);

		// Set widget parameters
		this.document.documentElement.style.setProperty('--widget_background', `url("${EnvService.widget_bg_name}"`);
		this.document.documentElement.style.setProperty('--widget_background_solid_color', EnvService.widget_bg_solid_color);
		this.document.documentElement.style.setProperty('--widget_background_color_1', EnvService.widget_bg_color_1);
		this.document.documentElement.style.setProperty('--widget_background_color_2', EnvService.widget_bg_color_2);
		this.document.documentElement.style.setProperty('--widget_background_color_3', EnvService.widget_bg_color_3);
		this.document.documentElement.style.setProperty('--widget_background_color_4', EnvService.widget_bg_color_4);

		// this.document.documentElement.style.setProperty('--arrow_down', `url(${EnvService.image_host}/images/plain_arrow_down.svg`);

		// Set color variables (white)
		this.document.documentElement.style.setProperty('--color_white', EnvService.color_white);
		// Set color variables (pink)
		this.document.documentElement.style.setProperty('--color_pink_900', EnvService.color_pink_900);
		this.document.documentElement.style.setProperty('--color_pink_800', EnvService.color_pink_800);
		this.document.documentElement.style.setProperty('--color_pink_700', EnvService.color_pink_700);
		this.document.documentElement.style.setProperty('--color_pink_600', EnvService.color_pink_600);
		this.document.documentElement.style.setProperty('--color_pink_500', EnvService.color_pink_500);
		this.document.documentElement.style.setProperty('--color_pink_400', EnvService.color_pink_400);
		this.document.documentElement.style.setProperty('--color_pink_300', EnvService.color_pink_300);
		this.document.documentElement.style.setProperty('--color_pink_200', EnvService.color_pink_200);
		this.document.documentElement.style.setProperty('--color_pink_100', EnvService.color_pink_100);
		this.document.documentElement.style.setProperty('--color_pink_50', EnvService.color_pink_50);
		// Set color variables (green)
		this.document.documentElement.style.setProperty('--color_green_900', EnvService.color_green_900);
		this.document.documentElement.style.setProperty('--color_green_800', EnvService.color_green_800);
		this.document.documentElement.style.setProperty('--color_green_700', EnvService.color_green_700);
		this.document.documentElement.style.setProperty('--color_green_600', EnvService.color_green_600);
		this.document.documentElement.style.setProperty('--color_green_500', EnvService.color_green_500);
		this.document.documentElement.style.setProperty('--color_green_400', EnvService.color_green_400);
		this.document.documentElement.style.setProperty('--color_green_300', EnvService.color_green_300);
		this.document.documentElement.style.setProperty('--color_green_200', EnvService.color_green_200);
		this.document.documentElement.style.setProperty('--color_green_100', EnvService.color_green_100);
		this.document.documentElement.style.setProperty('--color_green_50', EnvService.color_green_50);
		// Set color variables (orange)
		this.document.documentElement.style.setProperty('--color_orange_900', EnvService.color_orange_900);
		this.document.documentElement.style.setProperty('--color_orange_800', EnvService.color_orange_800);
		this.document.documentElement.style.setProperty('--color_orange_700', EnvService.color_orange_700);
		this.document.documentElement.style.setProperty('--color_orange_600', EnvService.color_orange_600);
		this.document.documentElement.style.setProperty('--color_orange_500', EnvService.color_orange_500);
		this.document.documentElement.style.setProperty('--color_orange_400', EnvService.color_orange_400);
		this.document.documentElement.style.setProperty('--color_orange_300', EnvService.color_orange_300);
		this.document.documentElement.style.setProperty('--color_orange_200', EnvService.color_orange_200);
		this.document.documentElement.style.setProperty('--color_orange_100', EnvService.color_orange_100);
		this.document.documentElement.style.setProperty('--color_orange_50', EnvService.color_orange_50);
		// Set color variables (purple)
		this.document.documentElement.style.setProperty('--color_purple_900_text', EnvService.color_purple_900_text);
		this.document.documentElement.style.setProperty('--color_purple_900_icons', EnvService.color_purple_900_icons);
		this.document.documentElement.style.setProperty('--color_purple_900', EnvService.color_purple_900);
		this.document.documentElement.style.setProperty('--color_purple_800', EnvService.color_purple_800);
		this.document.documentElement.style.setProperty('--color_purple_700', EnvService.color_purple_700);
		this.document.documentElement.style.setProperty('--color_purple_600', EnvService.color_purple_600);
		this.document.documentElement.style.setProperty('--color_purple_500', EnvService.color_purple_500);
		this.document.documentElement.style.setProperty('--color_purple_400', EnvService.color_purple_400);
		this.document.documentElement.style.setProperty('--color_purple_300', EnvService.color_purple_300);
		this.document.documentElement.style.setProperty('--color_purple_200', EnvService.color_purple_200);
		this.document.documentElement.style.setProperty('--color_purple_100', EnvService.color_purple_100);
		this.document.documentElement.style.setProperty('--color_purple_50', EnvService.color_purple_50);
		// Set color variables (blue)
		this.document.documentElement.style.setProperty('--color_main_blue_900', EnvService.color_main_blue_900);
		this.document.documentElement.style.setProperty('--color_main_blue_800', EnvService.color_main_blue_800);
		this.document.documentElement.style.setProperty('--color_main_blue_700', EnvService.color_main_blue_700);
		this.document.documentElement.style.setProperty('--color_main_blue_600', EnvService.color_main_blue_600);
		this.document.documentElement.style.setProperty('--color_main_blue_500', EnvService.color_main_blue_500);
		this.document.documentElement.style.setProperty('--color_main_blue_400', EnvService.color_main_blue_400);
		this.document.documentElement.style.setProperty('--color_main_blue_300', EnvService.color_main_blue_300);
		this.document.documentElement.style.setProperty('--color_main_blue_200', EnvService.color_main_blue_200);
		this.document.documentElement.style.setProperty('--color_main_blue_100', EnvService.color_main_blue_100);
		this.document.documentElement.style.setProperty('--color_main_blue_50', EnvService.color_main_blue_50);
	}

	private startKycNotifications(): void {
		console.log('Start KYC notifications');
		this.subscriptions.add(
			this.notification.subscribeToKycNotifications().subscribe(
				() => this.loadAccountData(),
				(error) => {
					setTimeout(() => {
						console.error('[1] KYC notification start error', error);
						if (error.message === 'Access denied') {
							this.subscriptions.add(
								this.auth.refreshToken().pipe(shareReplay(1)).subscribe(
									() => {
										console.log('Token refreshed');
										setTimeout(() => {
											this.subscriptions.add(
												this.notification.subscribeToKycNotifications().subscribe(
													() => {
														this.loadAccountData();
													},
													(error) => {
														console.error('[2] KYC notification start error', error);
														window.location.reload();
													}
												)
											);
										}, 500);
									},
									(error) => {
										console.error('Refresh token error: ', error);
									}
								)
							);
						}
					}, 500);
				}
			)
		);
	}

	private loadAccountData(): void {
		console.log('loadAccountData');
		const meQuery$ = this.profileService.getProfileData().valueChanges.pipe(take(1));
		this.subscriptions.add(
			meQuery$.subscribe(({ data }) => {
				if (data) {
					console.log('loadAccountData result:', data);
					this.auth.setUser(data.me as User);
					this.auth.notifyUserUpdated();
				}
			})
		);
	}
}
