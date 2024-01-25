import {
	Component,
	EventEmitter,
	Output,
	Inject,
	AfterViewInit,
	OnDestroy,
	Renderer2,
} from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { EnvService } from 'services/env.service';
import { DOCUMENT } from '@angular/common';
import { TurnstileOptions } from './interfaces/turnstile-options';

const CALLBACK_NAME = 'onloadTurnstileCallback';
declare global {
	interface Window {
		onloadTurnstileCallback: () => void;
		turnstile: {
			render: (
				idOrContainer: string | HTMLElement,
				options: TurnstileOptions
			) => string;
			reset: (widgetIdOrContainer: string | HTMLElement) => void;
			getResponse: (
				widgetIdOrContainer: string | HTMLElement
			) => string | undefined;
			remove: (widgetIdOrContainer: string | HTMLElement) => void;
		};
	}
}

@Component({
	selector: 'app-recaptcha',
	templateUrl: 'recaptcha.component.html',
	styleUrls: ['recaptcha.component.scss'],
})
export class RecaptchaComponent implements AfterViewInit, OnDestroy {
  @Output() completed = new EventEmitter();
  @Output() onReject = new EventEmitter();
  @Output() onError = new EventEmitter<string>();

  siteKey = EnvService.recaptchaSiteKey;
  provider = EnvService.recaptchaProvider;
  scriptTag = undefined;
  widgetId = '';

  constructor(
  	@Inject(DOCUMENT) private document: Document,
  	public dialog: MatDialog
  ) {}

  ngAfterViewInit(): void {
  	this.includeScript();

  	const turnstileOptions: TurnstileOptions = {
  		sitekey: this.siteKey,
  		appearance: 'always',
  		callback: (token: string) => this.capchaResult(token),
  	};
  	this.turnstileCaptchaRender(turnstileOptions);
  }
  ngOnDestroy(): void {
  	if(this.widgetId){
  		window.turnstile.remove(this.widgetId);
  	}
		
  	if (this.scriptTag) {
  		this.scriptTag.parentNode.removeChild(this.scriptTag);
  		this.scriptTag = undefined;
  	}
  }
  turnstileCaptchaRender(turnstileOptions: TurnstileOptions): void {
  	window[CALLBACK_NAME] = () => {
  		this.widgetId = window.turnstile.render('#recaptcha', turnstileOptions);
  	};
  }
  includeScript(): void {
  	const head = this.document.getElementsByTagName('head')[0];
  	this.scriptTag = this.document.createElement('script');
  	this.scriptTag.src = `https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit&onload=${CALLBACK_NAME}`;
  	head.appendChild(this.scriptTag);
  }
  capchaResult(token: string): void {
  	localStorage.setItem('recaptchaId', token);
  	this.completed.emit(token);
  }
}
