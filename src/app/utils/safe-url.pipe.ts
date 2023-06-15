import { Pipe, PipeTransform } from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';

@Pipe({ name: 'safeurl' })
export class SafeUrlPipe implements PipeTransform {
	constructor(private domSanitizer: DomSanitizer) { }
	transform(url: string): SafeResourceUrl {
		//return this.domSanitizer.sanitize(SecurityContext.URL, url);
		return this.domSanitizer.bypassSecurityTrustResourceUrl(url);
	}
}
