import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Router } from '@angular/router';
import { MenuItem } from 'src/app/model/common.model';
import { UserType } from 'src/app/model/generated-models';
import { AuthService } from 'src/app/services/auth.service';

@Component({
    selector: 'app-settings-bar',
    templateUrl: './settings-bar.component.html',
    styleUrls: ['../../../../assets/menu.scss']
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
        } as MenuItem,
        // {
        //     id: 'iplist',
        //     name: 'White List'
        // } as MenuItem
    ];

    constructor(private router: Router, private auth: AuthService) {
        if (auth.user?.type === UserType.Merchant && auth.isMerchantApproved()) {
            this.tabs.push({
                id: 'apikeys',
                name: 'API Keys'
            } as MenuItem);
        }
    }

    onSelect(itemId: string): void {
        this.select.emit(itemId);
        this.router.navigateByUrl(`${this.auth.getUserAccountPage()}/settings/${itemId}`);
    }
}
