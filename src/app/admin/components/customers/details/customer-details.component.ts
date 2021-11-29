import { Component, Input } from '@angular/core';
import { UserItem } from 'src/app/model/user.model';

@Component({
  selector: 'app-customer-details',
  templateUrl: 'customer-details.component.html',
  styleUrls: ['customer-details.component.scss']
})
export class CustomerDetailsComponent {
  @Input() customer?: UserItem;
}
