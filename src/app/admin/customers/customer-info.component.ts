import { Component, Input } from '@angular/core';
import { UserItem } from 'src/app/model/user.model';

@Component({
    selector: 'app-customer-info',
    templateUrl: 'customer-info.component.html',
    styleUrls: ['../admin.scss', 'customer-details.component.scss']
})
export class CustomerInfoComponent {
    @Input() customer: UserItem | null = null;
}
