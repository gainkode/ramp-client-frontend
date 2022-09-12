import { Directive, HostListener } from '@angular/core';

@Directive({
  selector: '[appSidemenuToggle]'
})
export class SidemenuToggleDirective {
  private body:any = document.querySelector('body');
  constructor() { }

  @HostListener('click') toggleSidemenu(){
    console.log('sidenav-toggled', this.body.classList.contains('sidenav-toggled'));
    if (this.body.classList.contains('sidenav-toggled')) {
      document.querySelector('body')?.classList.remove('sidenav-toggled');
    }else{
      document.querySelector('body')?.classList.add('sidenav-toggled');

      // document.querySelector('body')?.classList.add('sidenav-toggled');
      // main-body app sidebar-mini
    }
  }
}
