import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { APP_INITIALIZER, NgModule, Optional, SkipSelf } from '@angular/core';

import { AppConfig } from './app-config';
import { AppInitializer } from './app-initializer';
import { AppInitService } from './app-init-service';

@NgModule({
	declarations: [],
	imports: [
		CommonModule,
		HttpClientModule,
	],
	exports: [],
	providers: [
		AppConfig,
		AppInitializer,
		AppInitService,
		{	//appinnitialazer
			provide: APP_INITIALIZER,
			useFactory: (appInitializer: AppInitializer) => () => appInitializer.init(),
			deps: [AppInitializer],
			multi: true
		},
	],
})
export class CoreModule {
	constructor(@Optional() @SkipSelf() parentModule: CoreModule) {
		if (parentModule) {
			throw new Error(
				'CoreModule is already loaded. Import it in the AppModule only.'
			);
		}
	}
}
