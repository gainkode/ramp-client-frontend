import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'jobStatus' })
export class JobStatusPipe implements PipeTransform {
	transform(value: number, hasErrors: boolean = false, type: 'task' | 'run' ): string {

		const jobRunStatuses = {
			1: 'Started',
			2: 'Completed',
			3: 'Delayed'
		};

		const jobTaskStatuses = {
			1: 'Waiting',
			2: 'Delayed',
			3: 'Started',
			4: 'Completed',
		};


		if (type === 'task') {
			return hasErrors && value === 4 ? 'Failed' : jobTaskStatuses[value];
		}

		if (type === 'run') {
			return hasErrors && value === 2 ? 'Failed' : jobRunStatuses[value];
		}

		return 'Unknown';
	}
}
