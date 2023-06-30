import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
	selector: 'app-side-expander-button',
	templateUrl: 'side-expander.component.html',
	styleUrls: []
})
export class SideExpanderComponent {
    @Input() expanded = false;
    @Output() stateChanged = new EventEmitter<boolean>();

    onClick(): void {
    	this.stateChanged.emit(!this.expanded);
    }
}
