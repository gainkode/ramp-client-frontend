import { Component, ElementRef, OnInit, Renderer2, ViewChild } from '@angular/core';
import { Subscription } from 'rxjs';
import { SwitcherService } from '../../services/switcher.service';
import * as switcher from './switcher';

@Component({
	selector: 'app-admin-switcher',
	templateUrl: './switcher.component.html',
	styleUrls: ['./switcher.component.scss'],
})
export class AdminSwitcherComponent implements OnInit {
	layoutSub: Subscription;

	body = document.querySelector('body');

  @ViewChild('switcher', { static: false }) switcher!: ElementRef;
  constructor(
  	public renderer: Renderer2,
  	public switcherServic: SwitcherService
  ) {
  	this.layoutSub = switcherServic.changeEmitted.subscribe((value) => {
  		if (value) {
  			this.renderer.addClass(this.switcher.nativeElement.firstElementChild,'active');
  			this.renderer.setStyle(this.switcher.nativeElement.firstElementChild,'right','0px');
  			value = true;
  		} else {
  			this.renderer.removeClass(this.switcher.nativeElement.firstElementChild,'active');
  			this.renderer.setStyle(this.switcher.nativeElement.firstElementChild,'right','-270px');
  			value = false;
  		}
  	});
  }
  ngOnInit(): void {
  	switcher.localStorageBackUp();
  	switcher.customClickFn();
  	switcher.updateChanges();
  }
  reset(): void{
  	sessionStorage.clear(); 
  	const html: any = document.querySelector('html');
  	const body = document.querySelector('body');

  	html.style = ''; 
  	body?.classList.remove('dark-theme');
  	body?.classList.remove('transparent-theme');
  	body?.classList.remove('light-header');
  	body?.classList.remove('dark-header');
  	body?.classList.remove('color-header');
  	body?.classList.remove('gradient-header');
  	body?.classList.remove('light-menu');
  	body?.classList.remove('color-menu');
  	body?.classList.remove('dark-menu');
  	body?.classList.remove('gradient-menu');
  	body?.classList.remove('layout-boxed');
  	body?.classList.remove('scrollable-layout');
  	body?.classList.remove('bg-img1');
  	body?.classList.remove('bg-img2');
  	body?.classList.remove('bg-img3');
  	body?.classList.remove('bg-img4');
  	switcher.updateChanges();
  	switcher.checkOptions();
  	const primaryColorVal = getComputedStyle(document.documentElement).getPropertyValue('--primary-bg-color').trim();
    
  	document.querySelector('html')?.style.setProperty('--primary-bg-color', primaryColorVal);
  
  }

  public color1 = '#38cab3';
  public color2 = '#38cab3';
  public color3 = '#38cab3';
  public color4 = '#38cab3';
  public color5 = '#38cab3';

  public dynamicLightPrimary(data: any): void {
  	this.color1 = data.color;

  	const dynamicPrimaryLight = document.querySelectorAll('input.color-primary-light');

  	switcher.dynamicLightPrimaryColor(dynamicPrimaryLight, this.color1);
    
  	sessionStorage.setItem('light-primary-color', this.color1);
  	sessionStorage.setItem('light-primary-hover', this.color1);
  	sessionStorage.setItem('light-primary-border', this.color1);
  	const light = document.getElementById('myonoffswitch1') as HTMLInputElement;
  	light.checked = true;

  	// Adding
  	this.body?.classList.add('light-theme');
  	sessionStorage.setItem('LightTheme', 'true');
    
  	// removing
  	sessionStorage.removeItem('DarkTheme');
  	sessionStorage.removeItem('TransparentTheme');
  	this.body?.classList.remove('dark-theme');
  	this.body?.classList.remove('transparent-theme');
  	this.body?.classList.remove('bg-img1');
  	this.body?.classList.remove('bg-img2');
  	this.body?.classList.remove('bg-img3');
  	this.body?.classList.remove('bg-img4');
    
  	sessionStorage.removeItem('dark-primary-color');
  	sessionStorage.removeItem('transparent-primary-color');
  	sessionStorage.removeItem('transparent-bg-color');
  	sessionStorage.removeItem('transparent-bgImg-primary-color');
  	sessionStorage.removeItem('BgImage');
  	switcher.checkOptions();
  	switcher.updateChanges();
  }
  public dynamicDarkPrimary(data: any): void {
  	this.color2 = data.color;

  	const dynamicPrimaryDark = document.querySelectorAll('input.color-primary-dark');

  	switcher.dynamicDarkPrimaryColor(dynamicPrimaryDark, this.color2);
    
  	sessionStorage.setItem('dark-primary-color', this.color2);
  	const dark = document.getElementById('myonoffswitch2') as HTMLInputElement;
  	dark.checked = true;

  	// Adding
  	this.body?.classList.add('dark-theme');
  	sessionStorage.setItem('DarkTheme', 'true');
    
  	// removing
  	sessionStorage.removeItem('LightTheme');
  	sessionStorage.removeItem('TransparentTheme');
  	this.body?.classList.remove('light-theme');
  	this.body?.classList.remove('transparent-theme');
  	this.body?.classList.remove('bg-img1');
  	this.body?.classList.remove('bg-img2');
  	this.body?.classList.remove('bg-img3');
  	this.body?.classList.remove('bg-img4');    
    
  	sessionStorage.removeItem('light-primary-color');
  	sessionStorage.removeItem('light-primary-hover');
  	sessionStorage.removeItem('light-primary-border');
  	sessionStorage.removeItem('transparent-primary-color');
  	sessionStorage.removeItem('transparent-bg-color');
  	sessionStorage.removeItem('transparent-bgImg-primary-color');
  	sessionStorage.removeItem('BgImage');
  	switcher.checkOptions();
  	switcher.updateChanges();
  }
  public dynamicTranparentPrimary(data: any): void {
  	this.color3 = data.color;

  	const dynamicPrimaryTrasnsparent = document.querySelectorAll('input.color-primary-transparent');

  	switcher.dynamicTrasnsparentPrimaryColor(
  		dynamicPrimaryTrasnsparent,
  		this.color3
  	);
  	sessionStorage.setItem('transparent-primary-color', this.color3);
  	const transparent = document.getElementById('myonoffswitchTransparent') as HTMLInputElement;
  	transparent.checked = true;

  	// Adding
  	this.body?.classList.add('transparent-theme');
  	sessionStorage.setItem('TransparentTheme', 'true');
    
  	// Removing
  	sessionStorage.removeItem('DarkTheme');
  	sessionStorage.removeItem('LightTheme');
  	this.body?.classList.remove('light-theme');
  	this.body?.classList.remove('dark-theme');
  	this.body?.classList.remove('bg-img1');
  	this.body?.classList.remove('bg-img2');
  	this.body?.classList.remove('bg-img3');
  	this.body?.classList.remove('bg-img4'); 
  	this.body?.classList.remove('light-header');
  	this.body?.classList.remove('dark-header');
  	this.body?.classList.remove('color-header');
  	this.body?.classList.remove('gradient-header');
  	this.body?.classList.remove('light-menu');
  	this.body?.classList.remove('color-menu');
  	this.body?.classList.remove('dark-menu');
  	this.body?.classList.remove('gradient-menu');   

  	sessionStorage.removeItem('light-primary-color');
  	sessionStorage.removeItem('light-primary-hover');
  	sessionStorage.removeItem('light-primary-border');
  	sessionStorage.removeItem('dark-primary-color');
  	sessionStorage.removeItem('transparent-bg-color');
  	sessionStorage.removeItem('transparent-bgImg-primary-color');
  	sessionStorage.removeItem('BgImage');
  	switcher.removeForTransparent();
  	switcher.updateChanges();
  }
  public dynamicTranparentBgPrimary(data: any): void {
  	this.color4 = data.color;

  	const dynamicPrimaryBgTrasnsparent = document.querySelectorAll('input.color-bg-transparent');

  	switcher.dynamicBgTrasnsparentPrimaryColor(
  		dynamicPrimaryBgTrasnsparent,
  		this.color4
  	);
  	sessionStorage.setItem('transparent-bg-color', this.color4);
  	const transparent = document.getElementById('myonoffswitchTransparent') as HTMLInputElement;
  	transparent.checked = true;

  	// Adding
  	this.body?.classList.add('transparent-theme');
  	sessionStorage.setItem('TransparentTheme', 'true');
    
  	// Removing
  	sessionStorage.removeItem('DarkTheme');
  	sessionStorage.removeItem('LightTheme');
  	this.body?.classList.remove('light-theme');
  	this.body?.classList.remove('dark-theme');
  	this.body?.classList.remove('bg-img1');
  	this.body?.classList.remove('bg-img2');
  	this.body?.classList.remove('bg-img3');
  	this.body?.classList.remove('bg-img4'); 
  	this.body?.classList.remove('light-header');
  	this.body?.classList.remove('dark-header');
  	this.body?.classList.remove('color-header');
  	this.body?.classList.remove('gradient-header');
  	this.body?.classList.remove('light-menu');
  	this.body?.classList.remove('color-menu');
  	this.body?.classList.remove('dark-menu');
  	this.body?.classList.remove('gradient-menu');

  	sessionStorage.removeItem('light-primary-color');
  	sessionStorage.removeItem('light-primary-hover');
  	sessionStorage.removeItem('light-primary-border');
  	sessionStorage.removeItem('dark-primary-color');
  	sessionStorage.removeItem('transparent-bgImg-primary-color');
  	sessionStorage.removeItem('BgImage');
  	switcher.removeForTransparent();
  	switcher.updateChanges();
  }
  public dynamicTranparentImgPrimary(data: any): void {
  	this.color5 = data.color;

  	const dynamicPrimaryBgImgTrasnsparent = document.querySelectorAll('input.color-primary-transparent-img');

  	switcher.dynamicBgImgTrasnsparentPrimaryColor(
  		dynamicPrimaryBgImgTrasnsparent,
  		this.color5
  	);
    
  	sessionStorage.setItem('transparent-bgImg-primary-color', this.color5);
  	const transparent = document.getElementById('myonoffswitchTransparent') as HTMLInputElement;
  	transparent.checked = true;

  	if (
  		document.querySelector('body')?.classList.contains('bg-img1') == false &&
      document.querySelector('body')?.classList.contains('bg-img2') == false &&
      document.querySelector('body')?.classList.contains('bg-img3') == false &&
      document.querySelector('body')?.classList.contains('bg-img4') == false
  	) {
  		document.querySelector('body')?.classList.add('bg-img1');
  		sessionStorage.setItem('BgImage', 'bg-img1');
  	}
  	// Adding
  	this.body?.classList.add('transparent-theme');
  	sessionStorage.setItem('TransparentTheme', 'true');
    
  	// Removing
  	sessionStorage.removeItem('DarkTheme');
  	sessionStorage.removeItem('LightTheme');
  	this.body?.classList.remove('light-theme');
  	this.body?.classList.remove('dark-theme'); 
  	this.body?.classList.remove('light-header');
  	this.body?.classList.remove('dark-header');
  	this.body?.classList.remove('color-header');
  	this.body?.classList.remove('gradient-header');
  	this.body?.classList.remove('light-menu');
  	this.body?.classList.remove('color-menu');
  	this.body?.classList.remove('dark-menu');
  	this.body?.classList.remove('gradient-menu');

  	sessionStorage.removeItem('light-primary-color');
  	sessionStorage.removeItem('light-primary-hover');
  	sessionStorage.removeItem('light-primary-border');
  	sessionStorage.removeItem('dark-primary-color');
  	sessionStorage.removeItem('transparent-primary-color');
  	sessionStorage.removeItem('transparent-bg-color');
  	switcher.removeForTransparent();
  	switcher.updateChanges();
  }

  bgImage(e: any): void {
  	const transparent = document.getElementById('myonoffswitchTransparent') as HTMLInputElement;
  	transparent.checked = true;

  	const img = e.parentElement.classList[0];
  	sessionStorage.setItem('BgImage', img);
  	// this.body?.classList.add(img);
  	const allImg = document.querySelectorAll('.bg-img');
  	allImg.forEach((el) => {
  		const ele = el.classList[0];
  		this.body?.classList.remove(ele);
  		this.body?.classList.add(img);
  	});

  	// Adding
  	this.body?.classList.add('transparent-theme');
  	sessionStorage.setItem('TransparentTheme', 'true');
    
  	// Removing
  	sessionStorage.removeItem('DarkTheme');
  	sessionStorage.removeItem('LightTheme');
  	this.body?.classList.remove('light-theme');
  	this.body?.classList.remove('dark-theme'); 
  	this.body?.classList.remove('light-header');
  	this.body?.classList.remove('dark-header');
  	this.body?.classList.remove('color-header');
  	this.body?.classList.remove('gradient-header');
  	this.body?.classList.remove('light-menu');
  	this.body?.classList.remove('color-menu');
  	this.body?.classList.remove('dark-menu');
  	this.body?.classList.remove('gradient-menu');
  	sessionStorage.removeItem('light-primary-color');
  	sessionStorage.removeItem('light-primary-hover');
  	sessionStorage.removeItem('light-primary-border');
  	sessionStorage.removeItem('dark-primary-color');
  	sessionStorage.removeItem('transparent-primary-color');
  	sessionStorage.removeItem('transparent-bg-color');
  	switcher.removeForTransparent();
  	switcher.updateChanges();
  }
}
