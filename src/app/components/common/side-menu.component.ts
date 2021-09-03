import { Component, EventEmitter, Input, Output, ViewChild } from '@angular/core';
import { MenuItem } from '../../model/common.model';

@Component({
    selector: 'app-side-menu',
    templateUrl: 'side-menu.component.html',
    styleUrls: ['../../fonts.scss', '../../colors.scss', '../../menu.scss', '../../button.scss']
})
export class SideMenuComponent {
    @Output() onMenuClick = new EventEmitter<MenuItem>();
    @Input() items: MenuItem[] | undefined = undefined;
    @Input() selectedItem: string = '';
    @Input() expanded = false;

    clickItem(item: MenuItem): void {
        if (this.onMenuClick) {
            this.onMenuClick.emit(item);
        }
    }
}
