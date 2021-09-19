import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
    selector: 'app-side-expander-button',
    templateUrl: 'side-expander.component.html',
    styleUrls: ['../../button.scss']
})
export class SideExpanderComponent {
    @Input() expanded = false;
    @Output() stateChanged = new EventEmitter<boolean>();

    onClick(): void {
        console.log('sideMenuExpanded click');
        this.stateChanged.emit(!this.expanded);
    }
}
