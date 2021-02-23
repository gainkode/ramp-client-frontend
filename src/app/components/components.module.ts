import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { DropdownItemComponent } from './dropdown-item.component';

@NgModule({
    imports: [CommonModule],
    declarations: [DropdownItemComponent],
    exports: [DropdownItemComponent]
})

export class ComponentsModule { }