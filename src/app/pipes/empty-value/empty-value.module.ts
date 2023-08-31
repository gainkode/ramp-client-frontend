import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { EmptyValuePipe } from './empty-value.pipe';

@NgModule({
	declarations: [EmptyValuePipe],
	exports: [EmptyValuePipe],
	imports: [CommonModule],
})
export class EmptyValueModule {}
