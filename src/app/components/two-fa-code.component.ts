import { Component, Input } from '@angular/core';
import { QrCodeData } from '../model/common.model';

@Component({
    selector: 'app-two-fa-code',
    templateUrl: 'two-fa-code.component.html',
    styleUrls: ['two-fa-code.component.scss']
})
export class TwoFaCodeComponent {
    @Input() data!: QrCodeData;
}
