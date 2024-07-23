import { Injectable } from '@angular/core';
import { PlatformInfo } from 'model/generated-models';

@Injectable()
export class AppConfig {
	private _platformInfo: PlatformInfo;

	get platformInfo(): PlatformInfo {
		if (!this._platformInfo) {
			throw new Error('PlatformInfo not yet resolved!');
		}

		return this._platformInfo;
	}

	setPlatformInfo(platformInfo: PlatformInfo): void {
		this._platformInfo = platformInfo;
	}
}