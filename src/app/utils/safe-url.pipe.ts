import { Pipe, PipeTransform } from '@angular/core';
import { DomSanitizer, SafeResourceUrl, SafeUrl } from '@angular/platform-browser';

@Pipe({ name: 'safeurl' })
export class SafeUrlPipe implements PipeTransform {
	constructor(private domSanitizer: DomSanitizer) { }
	transform(url: string, isImage: boolean = false): SafeResourceUrl | SafeUrl {
		if (isImage) {
			return this.domSanitizer.bypassSecurityTrustUrl(url);
		}

		return this.domSanitizer.bypassSecurityTrustResourceUrl(url);
	}
}
