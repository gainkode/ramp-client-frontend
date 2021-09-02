import { Component, EventEmitter, Input, Output, ViewChild } from '@angular/core';
import { MenuItem } from '../../model/common.model';
import { MatMenuTrigger } from '@angular/material/menu';

@Component({
  selector: 'app-nav-popup',
  templateUrl: 'nav-popup.component.html',
  styleUrls: ['nav-popup.component.scss', '../../fonts.scss', '../../colors.scss']
})
export class NavPopupComponent {
    @ViewChild('menuTrigger') menuTrigger!: MatMenuTrigger;
    @Output() onMenuClick = new EventEmitter<MenuItem>();
    @Input() items: MenuItem[] | undefined = undefined;
    @Input() userName: string = '';

    clickItem(item: MenuItem): void {
        if (this.onMenuClick) {
            this.onMenuClick.emit(item);
        }
    }
}
