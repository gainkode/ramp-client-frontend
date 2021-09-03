import { Component, EventEmitter, Input, Output, ViewChild } from '@angular/core';
import { MenuItem } from '../../model/common.model';
import { MatMenuTrigger } from '@angular/material/menu';
import { MenuCloseReason } from '@angular/material/menu/menu';

@Component({
    selector: 'app-nav-popup',
    templateUrl: 'nav-popup.component.html',
    styleUrls: ['nav-popup.component.scss', '../../fonts.scss', '../../colors.scss', '../../menu.scss']
})
export class NavPopupComponent {
    @ViewChild('menuTrigger') menuTrigger!: MatMenuTrigger;
    @Output() onMenuClick = new EventEmitter<MenuItem>();
    @Input() items: MenuItem[] | undefined = undefined;
    @Input() userName: string = '';

    menuOpened = false;

    clickItem(item: MenuItem): void {
        if (this.onMenuClick) {
            this.onMenuClick.emit(item);
        }
    }

    onMenuOpened(): void {
        this.menuOpened = true;
    }

    onMenuClosed(reason: MenuCloseReason): void {
        this.menuOpened = false;
    }

    isItemSeparatorVisible(itemIndex: number): boolean {
        let result = false;
        if (this.items) {
            result = (itemIndex < this.items.length - 1);
        }
        return result;
    }
}
