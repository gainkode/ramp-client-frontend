import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Router } from '@angular/router';
import { MenuItem } from 'src/app/model/common.model';
import { AuthService } from 'src/app/services/auth.service';

@Component({
    selector: 'app-settings-bar',
    templateUrl: './settings-bar.component.html',
    styleUrls: ['../../../../../assets/menu.scss']
})
export class SettingsMenuBarComponent {
    @Input() selectedTab = 'info';
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

    constructor(private router: Router, private auth: AuthService) { }

    onSelect(itemId: string): void {
        this.select.emit(itemId);
        this.router.navigateByUrl(`${this.auth.getUserAccountPage()}/settings/${itemId}`);
    }
}
