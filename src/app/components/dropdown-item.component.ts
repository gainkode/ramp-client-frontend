import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-dropdown-item',
  templateUrl: 'dropdown-item.component.html'
})
export class DropdownItemComponent {
    @Input() itemValue: string | null = null;
    @Input() imageSource: string | null = null;
    @Input() imageClass = '';
}
