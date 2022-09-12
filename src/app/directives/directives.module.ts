import { NgModule } from '@angular/core';
import { HoverEffectSidebarDirective } from '../admin/directives/hover-effect-sidebar.directive';
import { SidemenuToggleDirective } from '../admin/directives/sidemenuToggle';
import { OnlyNumberDirective } from './only-number.directive';

@NgModule({
  declarations: [
    OnlyNumberDirective,
    SidemenuToggleDirective,
    HoverEffectSidebarDirective
  ],
  exports: [
    OnlyNumberDirective,
    SidemenuToggleDirective,
    HoverEffectSidebarDirective
  ]
})

export class DirectiveModule { }
