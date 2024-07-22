import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ScrollingModule } from '@angular/cdk/scrolling';
import { TranslocoRootModule } from 'transloco-root.module';

import {
	AddressValidatorDirective
} from './directives';


const sharedModules = [
	CommonModule,
	FormsModule,
	ReactiveFormsModule,
	RouterModule,
	TranslocoRootModule,
	ScrollingModule,
];

const sharedDirectives = [
	AddressValidatorDirective
];

const sharedComponents = [
	// components, dialogs, etc...
	
];

const sharedPipes = [

];

const sharedServices = [
	// services, guards, etc...

];

@NgModule({
	declarations: [
		...sharedDirectives,
		...sharedComponents,
		...sharedPipes,
	],
	imports: [
		...sharedModules,
	],
	exports: [
		...sharedModules,
		...sharedDirectives,
		...sharedComponents,
		...sharedPipes
	],
	providers: [
		...sharedServices
	]
})
export class SharedModule { }
