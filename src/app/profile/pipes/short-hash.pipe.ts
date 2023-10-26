import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
	name: 'shortHash'
})
export class ShortHashPipe implements PipeTransform {

	transform(value: string): string {
		if (!value) {
			return value;
		}
		return value.slice(0, 4) + '-' + value.slice(-4);
	}
}