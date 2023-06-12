import { Injectable } from '@angular/core';
import { NgbDateParserFormatter, NgbDateStruct } from '@ng-bootstrap/ng-bootstrap';

@Injectable()
export class DateParserFormatter extends NgbDateParserFormatter {

	readonly DELIMITER = '/';

	parse(value: string): NgbDateStruct | null {
		if (value) {
			const date = value.split(this.DELIMITER);
			return {
				day: parseInt(date[0], 10),
				month: parseInt(date[1], 10),
				year: parseInt(date[2], 10)
			};
		}
		return null;
	}

	format(date: NgbDateStruct | null): string {
		const d = ((date?.day ?? 0) < 10 ? '0' : '');
		const m = ((date?.month ?? 0) < 10 ? '0' : '');
		return date ? `${d}${date.day}${this.DELIMITER}${m}${date.month}${this.DELIMITER}${date.year}` : '';
	}
}