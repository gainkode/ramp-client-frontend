import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
	name: 'numberfill'
})

export class NumberFillPipe implements PipeTransform {
	transform(value: number, length: number): string {
		let str = value.toString();
		while (str.length < length) {
			str = '0' + str;
		}
		return str;
	}
}
