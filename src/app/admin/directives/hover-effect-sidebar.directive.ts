import { Directive, HostListener } from '@angular/core';

@Directive({
	selector: '[appHoverEffectSidebar]',
})
export class HoverEffectSidebarDirective {
	constructor(){}

	@HostListener('mouseover') onHover(): void {
		if (window.innerWidth > 768) {
			document
				.querySelector('.sidenav-toggled')
				?.classList.add('sidenav-toggled-open');
		}
	}
	@HostListener('mouseleave') onLeave(): void {
		if (window.innerWidth > 768) {
			document
				.querySelector('.sidenav-toggled')
				?.classList.remove('sidenav-toggled-open');
		}
	}
}
