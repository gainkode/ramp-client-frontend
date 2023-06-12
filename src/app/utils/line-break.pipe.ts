import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
	name: 'linebreak'
})
export class LineBreakPipe implements PipeTransform {
	transform(value: string): string {
		return value.replace(/\n/g, '<br/>');
	}
}
