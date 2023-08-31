import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
	name: 'emptyValue',
})
export class EmptyValuePipe implements PipeTransform {
	public transform(value: unknown): unknown {
		if (value !== 0 && value !== false && !value) {
			return '-';
		}

		return value;
	}
}
