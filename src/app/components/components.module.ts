import { CommonModule } from '@angular/common';
import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { DropdownItemComponent } from './dropdown-item.component';
import { BackButtonComponent } from './backbutton.component';
import { TabLabelComponent } from './tablabel.component';

const materialModules = [
    MatButtonModule,
    MatIconModule
];

@NgModule({
    imports: [...materialModules],
    exports: [...materialModules]
})
export class MaterialModule { }

@NgModule({
    imports: [CommonModule, MaterialModule],
    declarations: [DropdownItemComponent, BackButtonComponent, TabLabelComponent],
    exports: [DropdownItemComponent, BackButtonComponent, TabLabelComponent],
    schemas: [CUSTOM_ELEMENTS_SCHEMA]
})

export class ComponentsModule { }