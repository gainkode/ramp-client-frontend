import { Component, Input, OnInit } from '@angular/core';
import { KycLevelShort } from '../model/identification.model';

@Component({
  selector: 'kyc-panel',
  templateUrl: 'kyc-panel.component.html',
  styleUrls: ['kyc-panel.component.scss']
})
export class KycPanelComponent implements OnInit {
    @Input() level: KycLevelShort | null = null;

    description = '';

    ngOnInit(): void {
        this.description = this.level?.description as string;
    }
}
