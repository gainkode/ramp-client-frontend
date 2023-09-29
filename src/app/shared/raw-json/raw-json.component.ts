import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
	selector: 'app-raw-json',
	templateUrl: './raw-json.component.html',
	styleUrls: ['./raw-json.component.scss']
})
export class RawJsonComponent {
	@Input() data: object;
	@Input() isModal = false;

	@Output() close = new EventEmitter();
	
	constructor() {
	}

	closeEvent(): void {
		this.close.emit();
	}

}
