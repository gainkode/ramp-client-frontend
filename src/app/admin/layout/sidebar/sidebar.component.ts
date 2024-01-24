import {
	Component,
	ViewEncapsulation,
	HostListener,
	ElementRef,
} from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { Menu, NavService } from '../../services/nav.service';
import { fromEvent } from 'rxjs';
import { AuthService } from 'services/auth.service';
import { EnvService } from 'services/env.service';

@Component({
	selector: 'app-admin-sidebar',
	templateUrl: './sidebar.component.html',
	styleUrls: ['./sidebar.component.scss'],
	encapsulation: ViewEncapsulation.None,
})
export class AdminSidebarComponent {
	public menuItems!: Menu[];
	public url: any;
	public logoSrc = `${EnvService.image_host}/images/logo-dark.png`;
	public logoAlt = EnvService.product;

	constructor(
		public router: Router,
		private auth: AuthService,
		private navServices: NavService,
		public elRef: ElementRef
	) {
		this.navServices.items.subscribe((menuItems) => {
			// show only those items that are accessible to the user
			this.menuItems = this.filterMenuItemsByPermissions(menuItems);
			
			this.router.events.subscribe((event) => {
				if (event instanceof NavigationEnd) {
					menuItems.filter((items) => {
						if (items.path === event.url) {
							this.setNavActive(items);
						}
						if (!items.children) {
							return false;
						}
						items.children.filter((subItems) => {
							if (subItems.path === event.url) {
								this.setNavActive(subItems);
							}
							if (!subItems.children) {
								return false;
							}
							subItems.children.filter((subSubItems) => {
								if (subSubItems.path === event.url) {
									this.setNavActive(subSubItems);
								}
								return true;
							});
							return true;
						});
						return true;
					});
				}
			});
		});
	}

	// Active NavBar State
	setNavActive(item: any) {
		this.menuItems.filter((menuItem) => {
			if (menuItem !== item) {
				menuItem.active = false;
				document.querySelector('.app')?.classList.remove('sidenav-toggled');
				document.querySelector('.app')?.classList.remove('sidenav-toggled1');
				this.navServices.collapseSidebar = false;
			}
			if (menuItem.children && menuItem.children.includes(item)) {
				menuItem.active = true;
			}
			if (menuItem.children) {
				menuItem.children.filter((submenuItems) => {
					if (submenuItems.children && submenuItems.children.includes(item)) {
						menuItem.active = true;
						submenuItems.active = true;
					}
				});
			}
		});
	}

	// Click Toggle menu
	toggleNavActive(item: any) {
		if (!item.active) {
			this.menuItems.forEach((a: any) => {
				if (this.menuItems.includes(item)) {
					a.active = false;
				}
				if (!a.children) {
					return false;
				}
				a.children.forEach((b: any) => {
					if (a.children.includes(item)) {
						b.active = false;
					}
				});
				return true;
			});
		}
		item.active = !item.active;
	}

	ngOnInit(): void {
		const sidemenu = document.querySelector('.side-menu');
		sidemenu?.addEventListener('scroll', () => { }, { passive: false });
		sidemenu?.addEventListener('wheel', () => { }, { passive: false });

		//switcherArrowFn();

		fromEvent(window, 'resize').subscribe(() => {
			if (window.innerWidth > 772) {
				document.querySelector('body.horizontal')?.classList.remove('sidenav-toggled');
			}
			if (
				document.querySelector('body')?.classList.contains('horizontal-hover') &&
        window.innerWidth > 772
			) {
				const li = document.querySelectorAll('.side-menu li');
				li.forEach((e, i) => {
					e.classList.remove('is-expanded');
				});
			}
		});
	}

	goToMainPage() {
		this.router.navigate([this.auth.getUserMainPage()]).catch((e) => {
			throw new Error(e);
		});
	}

	sidebarClose() {
		if ((this.navServices.collapseSidebar === true)) {
			document.querySelector('.app')?.classList.remove('sidenav-toggled');
			this.navServices.collapseSidebar = false;
		}
	}

	scrolled = false;

	@HostListener('window:scroll', [])
	onWindowScroll() {
		this.scrolled = window.scrollY > 70;
	}

	private filterMenuItemsByPermissions(items: Menu[]): Menu[] {
		const filteredItems: Menu[] = [];
		for (let menuItem of items) {
			if (menuItem.code) {
				// If a menu item has a code, we shouldn't rely on the codes of the child elements
				if (this.auth.isPermittedObjectCode(menuItem.code)) {
					filteredItems.push(menuItem);
				}
			} else {
				// If main item doesn't have permission code we have to check if child items accessible to current user
				if (menuItem.children) {
					menuItem.children = this.filterMenuItemsByPermissions(menuItem.children);
					if (menuItem.children.length) {
						filteredItems.push(menuItem);
					}
				} else {
					filteredItems.push(menuItem);
				}
			}
		}

		return filteredItems;
	}
}
