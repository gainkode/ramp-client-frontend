import { Component, EventEmitter, Input, Output, ViewChild } from '@angular/core';
import { MenuItem } from '../model/common.model';
import { MatMenuTrigger } from '@angular/material/menu';

@Component({
  selector: 'app-nav-popup-item',
  templateUrl: 'nav-popup.component.html',
  styleUrls: ['../menu.scss']
})
export class NavPopupComponent {
    @ViewChild('menuTrigger') menuTrigger!: MatMenuTrigger;
    @Output() onMenuClick = new EventEmitter<MenuItem>();
    @Input() items: MenuItem[] | undefined = undefined;

    clickItem(item: MenuItem): void {
        if (this.onMenuClick) {
            this.onMenuClick.emit(item);
        }
    }
}
