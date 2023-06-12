import { fromEvent } from 'rxjs';

export function switcherArrowFn() {
	const slideLeft: any = document.querySelector('.slide-left');
	const slideRight: any = document.querySelector('.slide-right');
	const RTLslideLeft: any = document.querySelector('.slide-leftRTL');
	const RTLslideRight: any = document.querySelector('.slide-rightRTL');

	// fromEvent(slideLeft, 'click').subscribe(() => {
	//   slideClick();
	// });
	// fromEvent(slideRight, 'click').subscribe(() => {
	//   slideClick();
	// });

	// fromEvent(RTLslideLeft, 'click').subscribe(() => {
	//   slideClick();
	// });
	// fromEvent(RTLslideRight, 'click').subscribe(() => {
	//   slideClick();
	// });

	// used to remove is-expanded class and remove class on clicking arrow buttons
	function slideClick() {
		const slide = document.querySelectorAll<HTMLElement>('.slide');
		const slideMenu = document.querySelectorAll<HTMLElement>('.slide-menu');
		slide.forEach((element, index) => {
			if (element.classList.contains('is-expanded') == true) {
				element.classList.remove('is-expanded');
			}
		});
		slideMenu.forEach((element, index) => {
			if (element.classList.contains('open') == true) {
				element.classList.remove('open');
				element.style.display = 'none';
			}
		});
	}

	// horizontal arrows
	fromEvent(window, 'resize').subscribe(() => {
		const menuWidth: any =
      document.querySelector<HTMLElement>('.horizontal-main');
		const sideMenu: any = document.querySelector('.side-menu');
		const menuItems: any = document.querySelector<HTMLElement>('.side-menu');
		const mainSidemenuWidth: any =
      document.querySelector<HTMLElement>('.main-sidemenu');
		const menuContainerWidth =
      menuWidth?.offsetWidth - mainSidemenuWidth?.offsetWidth;
		const marginLeftValue = Math.ceil(
			Number(window.getComputedStyle(menuItems).marginLeft.split('px')[0])
		);
		const marginRightValue = Math.ceil(
			Number(window.getComputedStyle(menuItems).marginRight.split('px')[0])
		);
		const check =
      menuItems.scrollWidth + (0 - menuWidth?.offsetWidth) + menuContainerWidth;
		if (menuWidth?.offsetWidth > menuItems.scrollWidth) {
			document.querySelector('.slide-left')?.classList.add('d-none');
			document.querySelector('.slide-right')?.classList.add('d-none');
		}

		// to check and adjst the menu on screen size change
		if (document.querySelector('body')?.classList.contains('ltr')) {
			if (
				marginLeftValue > -check == false &&
        menuWidth?.offsetWidth - menuContainerWidth < menuItems.scrollWidth
			) {
				menuItems.style.marginLeft = -check;
			} else {
				menuItems.style.marginLeft = 0;
			}
		} else {
			if (
				marginRightValue > -check == false &&
        menuWidth?.offsetWidth < menuItems.scrollWidth
			) {
				menuItems.style.marginRight = -check;
			} else {
				menuItems.style.marginRight = 0;
			}
		}
		checkHoriMenu();
		// responsive();
	});

	checkHoriMenu();

	const slideLeftLTR: any = document.querySelector('.slide-left');
	const slideRightLTR: HTMLElement | any = document.querySelector('.slide-right');

	fromEvent(slideLeftLTR, 'click').subscribe(() => {
		const menuWidth: any =
      document.querySelector<HTMLElement>('.horizontal-main');
		const menuItems: any = document.querySelector<HTMLElement>('.side-menu');
		const mainSidemenuWidth: any =
      document.querySelector<HTMLElement>('.main-sidemenu');

		const menuContainerWidth =
      menuWidth?.offsetWidth - mainSidemenuWidth?.offsetWidth;
		const marginLeftValue =
      Math.ceil(
      	Number(window.getComputedStyle(menuItems).marginLeft.split('px')[0])
      ) + 100;

		if (marginLeftValue < 0) {
			// menuItems.style.marginRight = 0;
			menuItems.style.marginLeft =
        Number(menuItems.style.marginLeft.split('px')[0]) + 100 + 'px';
			if (menuWidth?.offsetWidth - menuContainerWidth < menuItems.scrollWidth) {
				document.querySelector('.slide-left')?.classList.remove('d-none');
				document.querySelector('.slide-right')?.classList.remove('d-none');
			}
		} else {
			document.querySelector('.slide-left')?.classList.add('d-none');
		}

		if (marginLeftValue >= 0) {
			// menuItems.style.marginRight = 0;
			menuItems.style.marginLeft = '0px';
			if (menuWidth?.offsetWidth < menuItems.scrollWidth) {
				document.querySelector('.slide-left')?.classList.add('d-none');
			}
		}

		// to remove dropdown when clicking arrows in horizontal menu
		const subNavSub = document.querySelectorAll<HTMLElement>('.sub-nav-sub');
		subNavSub.forEach((e) => {
			e.style.display = '';
		});
		const subNav = document.querySelectorAll<HTMLElement>('.nav-sub');
		subNav.forEach((e) => {
			e.style.display = '';
		});
		//
	});
	fromEvent(slideRightLTR, 'click').subscribe(() => {
		const menuWidth: any =
      document.querySelector<HTMLElement>('.horizontal-main');
		const menuItems: any = document.querySelector<HTMLElement>('.side-menu');
		const mainSidemenuWidth: any =
      document.querySelector<HTMLElement>('.main-sidemenu');
		const menuContainerWidth =
      menuWidth?.offsetWidth - mainSidemenuWidth?.offsetWidth;
		const marginLeftValue =
      Math.ceil(
      	Number(window.getComputedStyle(menuItems).marginLeft.split('px')[0])
      ) - 100;
		const check =
      menuItems.scrollWidth + (0 - menuWidth?.offsetWidth) + menuContainerWidth;

		if (marginLeftValue > -check) {
			// menuItems.style.marginRight = 0;
			menuItems.style.marginLeft =
        Number(menuItems.style.marginLeft.split('px')[0]) - 100 + 'px';
		} else {
			// menuItems.style.marginRight = 0;
			menuItems.style.marginLeft = -check + 'px';
			document.querySelector('.slide-right')?.classList.add('d-none');
		}
		if (marginLeftValue != 0) {
			document.querySelector('.slide-left')?.classList.remove('d-none');
		}
		// to remove dropdown when clicking arrows in horizontal menu
		const subNavSub = document.querySelectorAll<HTMLElement>('.sub-nav-sub');
		subNavSub.forEach((e) => {
			e.style.display = '';
		});
		const subNav = document.querySelectorAll<HTMLElement>('.nav-sub');
		subNav.forEach((e) => {
			e.style.display = '';
		});
		//
	});

	const slideLeftRTL: any = document.querySelector('.slide-leftRTL');
	const slideRightRTL: any = document.querySelector('.slide-rightRTL');

	fromEvent(slideLeftRTL, 'click').subscribe(() => {
		const menuItems: any = document.querySelector<HTMLElement>('.side-menu');
		const marginRightValue =
      Math.ceil(
      	Number(window.getComputedStyle(menuItems).marginRight.split('px')[0])
      ) + 100;

		if (marginRightValue < 0) {
			menuItems.style.marginLeft = '0px';
			menuItems.style.marginRight =
        Number(menuItems.style.marginRight.split('px')[0]) + 100 + 'px';
			document.querySelector('.slide-rightRTL')?.classList.remove('d-none');
			document.querySelector('.slide-leftRTL')?.classList.remove('d-none');
		} else {
			document.querySelector('.slide-leftRTL')?.classList.add('d-none');
		}

		if (marginRightValue >= 0) {
			// document.querySelector('.slide-leftRTL')?.classList.add('d-none');
			menuItems.style.marginLeft = '0px';
			menuItems.style.marginRight = '0px';
		}
		// to remove dropdown when clicking arrows in horizontal menu
		const subNavSub = document.querySelectorAll<HTMLElement>('.sub-nav-sub');
		subNavSub.forEach((e) => {
			e.style.display = '';
		});
		const subNav = document.querySelectorAll<HTMLElement>('.nav-sub');
		subNav.forEach((e) => {
			e.style.display = '';
		});
		//
	});
	fromEvent(slideRightRTL, 'click').subscribe(() => {
		const menuWidth: any =
      document.querySelector<HTMLElement>('.horizontal-main');
		const menuItems: any = document.querySelector<HTMLElement>('.side-menu');
		const mainSidemenuWidth: any =
      document.querySelector<HTMLElement>('.main-sidemenu');
		const menuContainerWidth =
      menuWidth?.offsetWidth - mainSidemenuWidth?.offsetWidth;
		const marginRightValue =
      Math.ceil(
      	Number(window.getComputedStyle(menuItems).marginRight.split('px')[0])
      ) - 100;
		const check =
      menuItems.scrollWidth + (0 - menuWidth?.offsetWidth) + menuContainerWidth;
		if (marginRightValue > -check) {
			menuItems.style.marginLeft = '0px';
			menuItems.style.marginRight =
        Number(menuItems.style.marginRight.split('px')[0]) - 100 + 'px';
		} else {
			menuItems.style.marginLeft = '0px';
			menuItems.style.marginRight = -check + 'px';
			document.querySelector('.slide-rightRTL')?.classList.add('d-none');
		}

		if (marginRightValue != 0) {
			document.querySelector('.slide-leftRTL')?.classList.remove('d-none');
		}
		// to remove dropdown when clicking arrows in horizontal menu
		const subNavSub = document.querySelectorAll<HTMLElement>('.sub-nav-sub');
		subNavSub.forEach((e) => {
			e.style.display = '';
		});
		const subNav = document.querySelectorAll<HTMLElement>('.nav-sub');
		subNav.forEach((e) => {
			e.style.display = '';
		});
	});
}

export function checkHoriMenu() {
	const menuWidth: any = document.querySelector<HTMLElement>('.horizontal-main');
	const menuItems: any = document.querySelector<HTMLElement>('.side-menu');
	const mainSidemenuWidth: any =
    document.querySelector<HTMLElement>('.main-sidemenu');

	const menuContainerWidth =
    menuWidth?.offsetWidth - mainSidemenuWidth?.offsetWidth;
	const marginLeftValue = Math.ceil(
		Number(window.getComputedStyle(menuItems).marginLeft.split('px')[0])
	);
	const marginRightValue = Math.ceil(
		Number(window.getComputedStyle(menuItems).marginRight.split('px')[0])
	);
	const check =
    menuItems.scrollWidth + (0 - menuWidth?.offsetWidth) + menuContainerWidth;

	if (document.querySelector('body')?.classList.contains('ltr')) {
		menuItems.style.marginRight = 0;
	} else {
		menuItems.style.marginLeft = 0;
	}

	if (menuItems.scrollWidth - 2 < menuWidth?.offsetWidth - menuContainerWidth) {
		document.querySelector('.slide-left')?.classList.add('d-none');
		document.querySelector('.slide-right')?.classList.add('d-none');
		document.querySelector('.slide-leftRTL')?.classList.add('d-none');
		document.querySelector('.slide-rightRTL')?.classList.add('d-none');
	} else if (marginLeftValue != 0 || marginRightValue != 0) {
		document.querySelector('.slide-right')?.classList.remove('d-none');
		document.querySelector('.slide-rightRTL')?.classList.remove('d-none');
	} else if (marginLeftValue != -check || marginRightValue != -check) {
		document.querySelector('.slide-left')?.classList.remove('d-none');
		document.querySelector('.slide-leftRTL')?.classList.remove('d-none');
	}
	if (menuItems.scrollWidth - 2 > menuWidth?.offsetWidth - menuContainerWidth) {
		document.querySelector('.slide-left')?.classList.remove('d-none');
		document.querySelector('.slide-right')?.classList.remove('d-none');
		document.querySelector('.slide-leftRTL')?.classList.remove('d-none');
		document.querySelector('.slide-rightRTL')?.classList.remove('d-none');
	}
	if (marginLeftValue == 0 || marginRightValue == 0) {
		document.querySelector('.slide-left')?.classList.add('d-none');
		document.querySelector('.slide-leftRTL')?.classList.add('d-none');
	}
	if (marginLeftValue !== 0 || marginRightValue !== 0) {
		document.querySelector('.slide-left')?.classList.remove('d-none');
		document.querySelector('.slide-leftRTL')?.classList.remove('d-none');
	}
}
