import { Component, EventEmitter, Input, Output } from '@angular/core';
import { MenuItem } from '../../model/common.model';

@Component({
	selector: 'app-side-menu',
	templateUrl: 'side-menu.component.html',
	styleUrls: ['../../../assets/fonts.scss', '../../../assets/colors.scss', '../../../assets/menu.scss']
})
export class SideMenuComponent {
    @Output() onMenuClick = new EventEmitter<MenuItem>();
    @Input() items: MenuItem[] | undefined = undefined;
    @Input() selectedItem = '';
    @Input() expanded = false;

    clickItem(item: MenuItem): void {
    	if (this.onMenuClick) {
    		this.onMenuClick.emit(item);
    	}
    }
}
