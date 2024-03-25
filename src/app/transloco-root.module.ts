import { HttpClient } from '@angular/common/http';
import {
	TRANSLOCO_LOADER,
	Translation,
	TranslocoLoader,
	TRANSLOCO_CONFIG,
	translocoConfig,
	TranslocoModule
} from '@ngneat/transloco';
import { Injectable, NgModule } from '@angular/core';
import { TranslocoPersistLangModule, TRANSLOCO_PERSIST_LANG_STORAGE } from '@ngneat/transloco-persist-lang';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class TranslocoHttpLoader implements TranslocoLoader {
	constructor(
		private readonly http: HttpClient,
	) {}

	getTranslation(lang: string): Observable<Translation> {
		const url = window.location.href;
		const applyTransalate = (url.includes('/payment/widget/') || url.includes('/payment/quickcheckout'));

		if (applyTransalate) {
			return this.http.get<Translation>(`/assets/i18n/${lang}.json?v=${Date.now()}`);
		} else {
			return this.http.get<Translation>(`/assets/i18n/en.json?v=${Date.now()}`);
		}
	}
}

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type, @typescript-eslint/typedef
export function getLangFn({
	cachedLang,
	browserLang,
	cultureLang,
	defaultLang,
}) {
	if (cachedLang) return cachedLang;

	const availableLangs = ['en','de','es','fr'];
	const lang = browserLang && availableLangs.includes(browserLang)
		? browserLang
		: defaultLang;
	return lang;
}

@NgModule({
	imports: [
		TranslocoPersistLangModule.forRoot({
			getLangFn,
			storage: {
				provide: TRANSLOCO_PERSIST_LANG_STORAGE,
				useValue: localStorage,
			},
		})
	],
	exports: [TranslocoModule],
	providers: [
		{
			provide: TRANSLOCO_CONFIG,
			useValue: translocoConfig({
				availableLangs: [
					{ id: 'en', label: 'EN' },
					{ id: 'es', label: 'ES' },
					{ id: 'de', label: 'DE' },
					{ id: 'fr', label: 'FR' }
				],
				defaultLang: 'en',
				fallbackLang: 'en',
				missingHandler: {
					useFallbackTranslation: false, // environment.env === 'production'
					logMissingKey: false
				},
				// Remove this option if your application doesn't support changing language in runtime.
				reRenderOnLangChange: true,  // environment.env !== 'production', TODO: set to false for better performance
				prodMode: false  //environment.env === 'production'
			})
		},
		{ provide: TRANSLOCO_LOADER, useClass: TranslocoHttpLoader }
	]
})
export class TranslocoRootModule { }
