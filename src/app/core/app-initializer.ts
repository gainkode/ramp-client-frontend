import { Injectable } from '@angular/core';
import { AppConfig } from './app-config';
import { AppInitService } from './app-init-service';

@Injectable()
export class AppInitializer {
	constructor(
		private readonly config: AppConfig,
		private readonly appInitService: AppInitService,
	) {
	}

	async init(): Promise<boolean> {
		try {
			const platformInfo = await this.appInitService.getPlatformInfo();
			this.config.setPlatformInfo(platformInfo);
			return true;

		} catch (error) {
			console.error('Error Platform info:', error);
			return false;
		}
	}
}