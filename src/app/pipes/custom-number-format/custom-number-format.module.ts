import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CustomNumberFormatPipe } from './custom-number-format.pipe';

@NgModule({
	declarations: [CustomNumberFormatPipe],
	exports: [CustomNumberFormatPipe],
	imports: [CommonModule],
})
export class CustomNumberFormatModule {}
