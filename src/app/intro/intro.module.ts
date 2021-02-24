import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatTooltipModule } from '@angular/material/tooltip'; 
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { ComponentsModule } from '../components/components.module';
import { IntroComponent } from './intro.component';

const routing = RouterModule.forChild([
    { path: '', component: IntroComponent },
    { path: '**', redirectTo: '/' }
]);

const modules = [
    MatButtonModule,
    MatTooltipModule,
    MatIconModule,
    ComponentsModule
];

@NgModule({
    imports: [...modules],
    exports: [...modules]
})
export class MaterialModule { }

@NgModule({
    imports: [
        CommonModule, routing, MaterialModule
    ],
    declarations: [
        IntroComponent
    ],
    schemas: [
        CUSTOM_ELEMENTS_SCHEMA
    ]
})
export class IntroModule { }
