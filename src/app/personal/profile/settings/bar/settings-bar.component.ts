import { Component, EventEmitter, Output } from '@angular/core';
import { MenuItem } from 'src/app/model/common.model';

@Component({
    selector: 'app-settings-bar',
    templateUrl: './settings-bar.component.html',
    styleUrls: ['../../../../../assets/menu.scss']
})
export class SettingsMenuBarComponent {
    @Output() select = new EventEmitter<string>();

    tabs: MenuItem[] = [
        {
            id: 'info',
            name: 'Personal info'
        } as MenuItem,
        {
            id: 'verification',
            name: 'Account verification'
        } as MenuItem,
        {
            id: 'security',
            name: 'Security'
        } as MenuItem
    ];
    selectedTab = 'info';

    constructor() { }

    onSelect(itemId: string): void {
        this.selectedTab = itemId;
        this.select.emit(itemId);
    }
}
