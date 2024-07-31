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
